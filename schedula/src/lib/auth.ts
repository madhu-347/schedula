import users from "./mockData.json";

export const loginUser = (email: string, password: string) => {
  return users.users.find(
    (user) => user.email === email && user.password === password
  );
};

export const createUser = (name: string, email: string, password: string) => {
  const alreadyExists = users.users.some((user) => user.email === email);
  if (alreadyExists) return null;
  //   this simulates user creation
  return { id: Date.now(), email, password, name };
};
