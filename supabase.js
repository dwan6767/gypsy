
const SUPABASE_URL = "https://tsufiyvxbivlkolwzsji.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzdWZpeXZ4Yml2bGtvbHd6c2ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzOTA0MzgsImV4cCI6MjA3NTk2NjQzOH0.7eWJeS4PFAE7bf-rQPc8cWjyqoPtLfYF-ccZ8BQHl_8";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const AVATAR_BUCKET = "avatars"; // ensure this bucket exists and is public

// ---------- NAVBAR & AUTH STATE ----------
const navLinks = document.getElementById("nav-links");

async function renderNavbar() {
  const { data } = await supabase.auth.getSession();
  const session = data?.session ?? null;
  const user = session?.user ?? null;

  if (!navLinks) return;

  if (user) {
    // prefer user_metadata values
    const meta = user.user_metadata ?? {};
    const name = meta.full_name || meta.fullName || meta.name || user.email;
    const avatar = meta.avatar_url || meta.avatarUrl || null;

    navLinks.innerHTML = `
      <a href="index.html">Home</a>
      <a href="products.html">Products</a>
      <a href="profile.html" class="user-link">
        <img src="${avatar ? avatar : 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22><rect width=%2232%22 height=%2232%22 fill=%22%23333%22/></svg>'}" alt="avatar" class="mini-avatar" />
        <span class="small">${escapeHtml(name)}</span>
      </a>
      <button id="logout-btn" class="btn ghost">Logout</button>
    `;

    document.getElementById("logout-btn").addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.href = "index.html";
    });

  } else {
    navLinks.innerHTML = `
      <a href="index.html">Home</a>
      <a href="products.html">Products</a>
      <a href="auth.html" id="login-link">Login</a>
    `;
  }
}

// call on load
renderNavbar();

// also update navbar when auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  renderNavbar();
});

// ---------- AUTH FORM (login/register + avatar upload) ----------
const form = document.getElementById("auth-form");
const messageEl = document.getElementById("message");
const switchEl = document.getElementById("switch");
const formTitle = document.getElementById("form-title");
const nameInput = document.getElementById("name");
const avatarInput = document.getElementById("avatar");
const avatarLabel = document.getElementById("avatar-label");
const submitBtn = document.getElementById("submit-btn");
let isLogin = true;

function showRegisterFields(show) {
  if (!nameInput || !avatarLabel) return;
  nameInput.style.display = show ? "block" : "none";
  avatarLabel.style.display = show ? "block" : "none";
}

showRegisterFields(false);

if (switchEl) {
  switchEl.addEventListener("click", (e) => {
    e.preventDefault();
    isLogin = !isLogin;
    formTitle.textContent = isLogin ? "Login" : "Register";
    submitBtn.textContent = isLogin ? "Login" : "Register";
    document.getElementById("toggle").innerHTML = isLogin
      ? 'No account? <a href="#" id="switch">Register</a>'
      : 'Already have one? <a href="#" id="switch">Login</a>';

    // re-bind the new switch element
    const newSwitch = document.getElementById("switch");
    if (newSwitch) {
      newSwitch.addEventListener("click", (ev) => {
        ev.preventDefault();
        // just toggle again
        newSwitch.parentElement.parentElement.querySelector('#switch')?.click();
      });
    }

    showRegisterFields(!isLogin);
  });
}

function showMessage(txt, isError = false) {
  if (!messageEl) return;
  messageEl.textContent = txt || "";
  messageEl.style.color = isError ? "tomato" : "";
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    showMessage("");

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      showMessage("Email and password are required", true);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showMessage("Logged in — redirecting...");
        setTimeout(() => (window.location.href = "index.html"), 900);
      } else {
        // Registration: create user, then upload avatar (if present), then update user_metadata
        const name = nameInput?.value?.trim() || "";
        const file = avatarInput?.files?.[0] ?? null;

        // create account (this sends confirmation email depending on your settings)
        const { data, error: signErr } = await supabase.auth.signUp({ email, password });
        if (signErr) throw signErr;

        // if user was created and file present, we can't upload before user confirms email (session may be null).
        // But usually signUp will return user if autoconfirm enabled. We'll attempt to upload only if session exists.
        const createdUser = data?.user ?? null;

        // If avatar selected AND we have a user id (session), upload to storage and update metadata.
        if (file && createdUser) {
          const id = createdUser.id;
          const ext = file.name.split(".").pop();
          const path = `public/${id}.${ext}`;
          const up = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, { upsert: true });
          if (up.error) {
            console.warn("avatar upload error:", up.error);
          } else {
            const { data: urlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
            const publicUrl = urlData?.publicUrl ?? null;
            if (publicUrl) {
              // update user metadata
              await supabase.auth.updateUser({ data: { full_name: name || undefined, avatar_url: publicUrl } });
            }
          }
        } else if (name && createdUser) {
          // only update name if provided
          await supabase.auth.updateUser({ data: { full_name: name } });
        }

        showMessage("Registration successful — check your email to confirm (if required).");
      }
    } catch (err) {
      showMessage(err?.message || String(err), true);
      console.error(err);
    }
  });
}

// ---------- PROFILE PAGE LOGIC ----------
const profileArea = document.getElementById("profile-area");
const profileAvatar = document.getElementById("profile-avatar");
const profileEmail = document.getElementById("profile-email");
const profileName = document.getElementById("profile-name");
const profileInput = document.getElementById("profile-avatar-input");
const saveBtn = document.getElementById("save-profile");
const deleteAvatarBtn = document.getElementById("delete-avatar");
const profileMsg = document.getElementById("profile-message");

async function loadProfile() {
  if (!profileArea) return; // not on profile page
  const { data } = await supabase.auth.getSession();
  const user = data?.session?.user ?? null;
  if (!user) {
    window.location.href = "auth.html";
    return;
  }
  const meta = user.user_metadata ?? {};
  profileEmail.textContent = user.email;
  profileName.value = meta.full_name || "";
  profileAvatar.src = meta.avatar_url || getDefaultAvatar(user.email);
}

function getDefaultAvatar(seed) {
  // tiny SVG fallback
  return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><rect width='100%' height='100%' fill='#0b1220'/><text x='50%' y='55%' font-size='36' fill='#6ee7b7' text-anchor='middle' font-family='Segoe UI, Roboto, Arial'>${(seed||'U').slice(0,1).toUpperCase()}</text></svg>`)}`;
}

async function uploadAvatarFile(file, userId) {
  if (!file || !userId) return null;
  const ext = file.name.split(".").pop();
  const path = `public/${userId}.${ext}`;
  const res = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, { upsert: true });
  if (res.error) throw res.error;
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return data?.publicUrl ?? null;
}

if (saveBtn) {
  saveBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    profileMsg.textContent = "";
    try {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user ?? null;
      if (!user) throw new Error("Not signed in");

      const newName = profileName.value.trim();
      const file = profileInput.files?.[0] ?? null;
      let avatarUrl = user.user_metadata?.avatar_url ?? null;

      if (file) {
        avatarUrl = await uploadAvatarFile(file, user.id);
      }

      // update user metadata
      const updateRes = await supabase.auth.updateUser({ data: { full_name: newName || undefined, avatar_url: avatarUrl || undefined } });
      if (updateRes.error) throw updateRes.error;

      profileMsg.textContent = "Saved.";
      await renderNavbar();
      // refresh user info on this page
      loadProfile();
    } catch (err) {
      profileMsg.textContent = err.message || String(err);
      profileMsg.style.color = "tomato";
      console.error(err);
    }
  });
}

if (deleteAvatarBtn) {
  deleteAvatarBtn.addEventListener("click", async () => {
    profileMsg.textContent = "";
    try {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user ?? null;
      if (!user) throw new Error("Not signed in");

      // Attempt to remove object(s) that belong to this user (named public/{id}.*)
      const list = await supabase.storage.from(AVATAR_BUCKET).list("public", { limit: 100, offset: 0 });
      if (list.error) throw list.error;
      const matches = list.data.filter(f => f.name.startsWith(user.id));
      if (matches.length) {
        const paths = matches.map(m => `public/${m.name}`);
        const del = await supabase.storage.from(AVATAR_BUCKET).remove(paths);
        if (del.error) console.warn("delete avatar error", del.error);
      }

      // remove metadata value
      const updateRes = await supabase.auth.updateUser({ data: { avatar_url: null } });
      if (updateRes.error) throw updateRes.error;

      profileMsg.textContent = "Avatar removed.";
      await renderNavbar();
      loadProfile();
    } catch (err) {
      profileMsg.textContent = err.message || String(err);
      profileMsg.style.color = "tomato";
    }
  });
}

// call loadProfile on pages where profile exists
loadProfile();


// ---------- small helper ----------
function escapeHtml(s){
  if(!s) return "";
  return String(s).replace(/[&<>"'`=\/]/g, function(c){ return "&#"+c.charCodeAt(0)+";"; });
}

