const router = require("express").Router();
const passport = require("passport");

const CLIENT_URL = "http://localhost:3000/"

router.get("/login/success", (req, res) => {
	if (req.user) {
		return res.status(200).json({
			error: false,
			message: "Successfully Loged In",
			user: req.user,
		});
	} else {
		return res.status(403).json({ error: true, message: "Not Authorized" });
	}
});

router.get("/login/failed", (req, res) => {
	return res.status(401).json({
		error: true,
		message: "Log in failure",
	});
});


router.get("/google", passport.authenticate("google", ["profile", "email"]));

router.get(
	"/google/callback",
	passport.authenticate("google", {
		successRedirect: CLIENT_URL,
		failureRedirect: "/login/failed",
	})
);

router.get("/logout", (req, res) => {
	req.logout();
	return res.redirect(CLIENT_URL);
});

module.exports = router;