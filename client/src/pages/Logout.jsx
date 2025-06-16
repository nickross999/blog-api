function Logout() {
    if (localStorage.getItem("jwt")) {
        localStorage.removeItem("jwt");
        window.location.href="/";
    }
    return null;
}

export default Logout;