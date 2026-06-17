const validatePassword = (password) => {
  if (!password || password.length < 8 || password.length > 16) {
    return "Password must be between 8 and 16 characters.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter.";
  }
  // Any character that is not a letter or digit is considered a special character
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must include at least one special character.";
  }
  return null;
};

const validateEmail = (email) => {
  if (!email) return "Email is required.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Email must be a valid email address.";
  }
  return null;
};

const validateName = (name) => {
  if (!name) return "Name is required.";
  if (name.length < 20 || name.length > 60) {
    return "Name must be between 20 and 60 characters.";
  }
  return null;
};

const validateAddress = (address) => {
  if (!address) return "Address is required.";
  if (address.length > 400) {
    return "Address must not exceed 400 characters.";
  }
  return null;
};

const handleValidation = (req, res, next) => {
  const errors = {};
  const fields = req.body;

  if ('name' in fields) {
    const err = validateName(fields.name);
    if (err) errors.name = err;
  }
  if ('email' in fields) {
    const err = validateEmail(fields.email);
    if (err) errors.email = err;
  }
  if ('address' in fields) {
    const err = validateAddress(fields.address);
    if (err) errors.address = err;
  }
  if ('password' in fields) {
    const err = validatePassword(fields.password);
    if (err) errors.password = err;
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: "Validation failed", errors });
  }

  next();
};

const validateUserFields = (req, res, next) => {
  const { name, email, address, password } = req.body;
  const errors = {};

  const nameErr = validateName(name);
  if (nameErr) errors.name = nameErr;

  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;

  const addressErr = validateAddress(address);
  if (addressErr) errors.address = addressErr;

  const passErr = validatePassword(password);
  if (passErr) errors.password = passErr;

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: "Validation failed", errors });
  }
  next();
};

const validatePasswordOnly = (req, res, next) => {
  const { password } = req.body;
  const err = validatePassword(password);
  if (err) {
    return res.status(400).json({ error: "Validation failed", errors: { password: err } });
  }
  next();
};

module.exports = {
  validateUserFields,
  validatePasswordOnly,
  handleValidation
};
