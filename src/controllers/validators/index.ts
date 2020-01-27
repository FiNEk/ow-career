import Joi from "@hapi/joi";

type UserRegRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};
export function validateUser(body: UserRegRequest) {
  const schema = Joi.object({
    firstName: Joi.string()
      .alphanum()
      .required()
      .min(2)
      .max(50)
      .trim(),
    lastName: Joi.string()
      .alphanum()
      .required()
      .min(2)
      .max(50)
      .trim(),
    email: Joi.string()
      .required()
      .min(5)
      .max(355)
      .email()
      .trim(),
    password: Joi.string()
      .required()
      .min(6)
      .max(30)
      .trim()
  });
  return schema.validate(body, { abortEarly: false });
}

type UserLoginRequest = {
  email: string;
  password: string;
};
export function validateLogin(body: UserLoginRequest) {
  const schema = Joi.object({
    email: Joi.string()
      .required()
      .min(5)
      .max(355)
      .email()
      .trim(),
    password: Joi.string()
      .required()
      .min(6)
      .max(30)
      .trim()
  });
  return schema.validate(body);
}

type CareerSearchRequest = {
  btag: string;
};

export function validateCareerSearch(body: CareerSearchRequest) {
  const schema = Joi.object({
    btag: Joi.string()
      .required()
      .min(1)
      .max(255)
      .trim()
  });
  return schema.validate(body);
}
