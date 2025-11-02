
const SUPABASE_URL = "https://tsufiyvxbivlkolwzsji.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzdWZpeXZ4Yml2bGtvbHd6c2ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzOTA0MzgsImV4cCI6MjA3NTk2NjQzOH0.7eWJeS4PFAE7bf-rQPc8cWjyqoPtLfYF-ccZ8BQHl_8";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================
// NAVBAR USER STATUS HANDLER
// ==========================
const navLinks = document.getElementById("nav-links");

async function refreshUser() {
  const { data } = await supabase.auth.getSession();
  const session = data.session;

  if (navLinks) {
    if (session && session.user) {
      const email = session.user.email;
      navLinks.innerHTML = `
        <a href="index.html">Home</a>
        <a href="products.html">Products</a>
        <span class="user-info">👤 ${email}</span>
        <button id="logout-btn" class="logout-btn">Logout</button>
      `;

      document
        .getElementById("logout-btn")
        .addEventListener("click", async () => {
          await supabase.auth.signOut();
          window.location.reload();
        });
    } else {
      navLinks.innerHTML = `
        <a href="index.html">Home</a>
        <a href="products.html">Products</a>
        <a href="auth.html" id="login-link">Login</a>
      `;
    }
  }
}

refreshUser();

// ==========================
// LOGIN / REGISTRATION LOGIC
// ==========================

const form = document.getElementById("auth-form");
const switchLink = document.getElementById("switch");
const title = document.getElementById("form-title");
const msg = document.getElementById("message");

let isLogin = true;

if (switchLink) {
  switchLink.addEventListener("click", (e) => {
    e.preventDefault();
    isLogin = !isLogin;
    title.textContent = isLogin ? "Login" : "Register";
    form.querySelector("button").textContent = isLogin ? "Login" : "Register";
    document.getElementById("toggle").innerHTML = isLogin
      ? 'No account? <a href="#" id="switch">Register</a>'
      : 'Already have one? <a href="#" id="switch">Login</a>';

    // re-bind switch after rewriting innerHTML
    document.getElementById("switch").addEventListener("click", (e) => {
      e.preventDefault();
      isLogin = !isLogin;
      title.textContent = isLogin ? "Login" : "Register";
      form.querySelector("button").textContent = isLogin ? "Login" : "Register";
    });
  });
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    msg.textContent = "";

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        msg.textContent = "Logged in successfully!";
        setTimeout(() => (window.location.href = "index.html"), 1000);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        msg.textContent = "Registration successful! Check your email.";
      }
    } catch (err) {
      msg.textContent = err.message;
    }
  });
}
