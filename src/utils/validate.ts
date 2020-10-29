import {UsernamePasswordInput} from "../resolvers/UsernamePasswordInput";

export const validateRegister = (values: UsernamePasswordInput) => {
  if (values.username.length < 3) {
    return [
      {
        field: "username",
        message: "Lo username deve essere lungo almeno 3 caratteri",
      },
    ];
  }
  if (values.username.includes("@")) {
    return [
      {
        field: "username",
        message: `Lo username non può contenere il carattere "@"`,
      },
    ];
  }

  if (values.password.length < 6) {
    return [
      {
        field: "password",
        message: "La password deve essere lunga almeno 6 caratteri",
      },
    ];
  }

  if (!values.email.includes("@")) {
    return [
      {
        field: "email",
        message: "Email non valida",
      },
    ];
  }

  return null;
};
