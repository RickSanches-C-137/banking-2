export interface SignUpBody {
  firstName: string;
  lastName: string;
  ssn: string;
  dob: string;
  email: string;
  password: string;
  maritalStatus: string;
}
export interface resetPassword {
  email: string;
  password: string;
}
export type SignInBody = {
  email: string;
  password: string;
};
