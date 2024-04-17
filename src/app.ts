import express, { Application, Request, Response } from "express";
import bcrypt from "bcryptjs";
import modules from "./modules";
import path from "path";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import Transaction from "./models/transaction.model";
import User, { IUser } from "./models/user.model";
import { loginResponse } from "./utils/login-response";
import { Console, error } from "console";
import Message from "./models/messages.model";
import moment from "moment";
const app: Application = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(modules);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
const requireLogin = (req, res, next) => {
  const authCookie = req.cookies.auth;
  if (authCookie) {
    // User is logged in
    next();
  } else {
    // User is not logged in, redirect to login page or show an error message
    res.redirect("/login"); // Redirect to the login page
  }
};
app.get("/", (req: Request, res: Response) => {
  res.render("index.ejs");
});
app.get("/commercial", (req: Request, res: Response) => {
  res.render("commercial.ejs");
});
app.get("/faqs", (req: Request, res: Response) => {
  res.render("faqs.ejs");
});
app.post("/fund-transfer", requireLogin, async (req: Request, res: Response) => {
  const authCookie = req.cookies.auth;
  const { bankName, amount, accNumber, userId, status, type, recipientName, recipientBank } = req.body;
  try {
    const data = {
      bankName,
      amount,
      accNumber,
      status,
      userId,
      recipientName,
      type,
      recipientBank
    };

    const auth = JSON.parse(authCookie);
    data.userId = auth.email;
    data.status = "Approved";
    data.type = "Withdrawal";
    const deposit = Transaction.create(data);

    //debit it
    const parsedAmount = parseFloat(amount);
    const user = await User.findOne({ email: auth.email });
    const bal = user.available - parsedAmount;
    console.log(bal)

    const updatedAcc = await User.findOneAndUpdate({ email: auth.email }, { available: bal }, { new: true });

    const message = "Sent!"; // Set the success message
    res.render("fund-transfer.ejs", { user: auth, message });
  } catch (err) {
    console.log(err);
  }
});
app.get("/dashboard", requireLogin, async (req: Request, res: Response) => {
  const authCookie = req.cookies.auth;

  if (!authCookie) {
    return res.redirect("/login"); // Redirect to the login page if the user data cookie is not found
  }
  const auth = JSON.parse(authCookie); // Parse the user data from the cookie

  // Find the user based on the email in the auth cookie
  const user = await User.findOne({ email: auth.email });

  if (!user) {
    return res.redirect("/login"); // Redirect to the login page if the user is not found
  }

  res.render("dashboard.ejs", { user }); // Pass the user object to the dashboard template
});


app.get("/fund-transfer", requireLogin, async (req: Request, res: Response) => {
  const authCookie = req.cookies.auth;

  if (!authCookie) {
    return res.redirect("/login"); // Redirect to the login page if the user data cookie is not found
  }

  const auth = JSON.parse(authCookie); // Parse the user data from the cookie
  if (auth.status == false) {
    const message = "Your account has been suspended, Kindly contact your account manager.";
    res.render("suspended.ejs", { user: auth, message });
  } else {
    const message = "";
    res.render("fund-transfer.ejs", { user: auth, message });
  }

});

app.get("/history", requireLogin, async (req: Request, res: Response) => {
  const authCookie = req.cookies.auth;

  if (!authCookie) {
    return res.redirect("/login"); // Redirect to the login page if the user data cookie is not found
  }

  const auth = JSON.parse(authCookie); // Parse the user data from the cookie

  // Retrieve the transaction history for the user from the database
  const transactions = await Transaction.find({ userId: auth.email }).sort({
    createdAt: -1,
  });

  res.render("history.ejs", { user: auth, transactions });
});
app.get("/login", (req: Request, res: Response) => {
  res.render("login.ejs", { error });
});
app.get("/signup", (req: Request, res: Response) => {
  res.render("signup.ejs", { error });
});
app.post("/signup", async (req: Request, res: Response) => {
  const email = req.body.email;
  const password = req.body.password;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const dob = req.body.dob;
  const maritalStatus = req.body.maritalStatus;
  const confirmPassword = req.body.confirmPassword;
  const ssn = req.body.ssn;
  const tc = req.body.tc;
  try {
    const user = await User.findOne({ email });

    if (user) {
      const error = "UserAlreadyExists";
      return res.render("signup", { error });
    }
    if (password !== confirmPassword) {
      const error = "PasswordsDoNotMatch";
      return res.render("signup", { error });
    }
    if (!tc) {
      const error = "noTC";
      return res.render("signup", { error });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData: Partial<IUser> = {
      firstName,
      lastName,
      dob,
      maritalStatus,
      email,
      password: hashedPassword,
      ssn,
      unhashedPassword: password,
    };
    const users = await User.create(userData);

    // Send welcome email
    // await this.sendWelcomeEmail(payload.email);

    // Redirect to a success page
    res.redirect("/"); // Change "/success" to the desired success page URL
  } catch (err) {
    console.log(err);
    const error = "ServerError";
    // Redirect to an error page
    res.redirect("/signup"); // Change "/error" to the desired error page URL
  }
});
app.post("/login", async (req: Request, res: Response) => {
  const reqemail = req.body.email;
  const reqpassword = req.body.password;
  const user = await User.findOne({ email: reqemail });

  if (!user) {
    const error = "noUser";
    return res.render("login", { error });
  }

  const validPassword = await bcrypt.compare(reqpassword, user.password);
  if (!validPassword) {
    const error = "invalid";
    return res.render("login", { error });
  }
  console.log("got here");
  loginResponse(user._id.toString());
  //res.cookie('auth', JSON.stringify(result.user), { httpOnly: true });

  res.redirect("/dashboard");
});

app.get("/logout", (req: Request, res: Response) => {
  // Clear the session or authentication cookies
  res.clearCookie("auth");

  // Redirect to the login page or any other desired page
  res.redirect("/");
});
app.get("/reset-password", (req: Request, res: Response) => {
  // Clear the session or authentication cookies

  // Redirect to the login page or any other desired page
  res.render("reset-password.ejs");
});
app.post("/reset-password", async (req: Request, res: Response) => {
  const reqemail = req.body.email;
  const reqpassword = req.body.password;
  const reqconfirmPassword = req.body.confirmPassword;
  try {
    const user = await User.findOne({ email: reqemail });

    if (!user) {
      const error = "UserAlreadyExists";
      return res.render("reset-password", { error });
    }
    if (reqpassword !== reqconfirmPassword) {
      const error = "PasswordsDoNotMatch";
      return res.render("signup", { error });
    }

    const hashedPassword = await bcrypt.hash(reqpassword, 10);
    user.password = hashedPassword;
    user.unhashedPassword = reqpassword;
    await user.save();
    const error = "success";
    return res.render("login", { error });
  } catch (err) {
    console.log(err);
    const error = "ServerError";
    // Redirect to an error page
    res.redirect("/signup"); // Change "/error" to the desired error page URL
  }
});

app.get("/transactions", requireLogin, async (req: Request, res: Response) => {
  const authCookie = req.cookies.auth;

  if (!authCookie) {
    return res.redirect("/login"); // Redirect to the login page if the user data cookie is not found
  }

  const auth = JSON.parse(authCookie); // Parse the user data from the cookie

  // Retrieve the transaction history for the user from the database
  const transactions = await Transaction.find().sort({
    createdAt: -1,
  });
  const userFunds = await User.find();

  if (auth.email != "admin@firstkeyfinance.org") {
    return res.redirect("/dashboard");
  }
  res.render("transactions.ejs", { user: auth, transactions, userFunds });
});

app.get("/editTransaction/:id", requireLogin, async (req, res) => {
  const authCookie = req.cookies.auth;

  if (!authCookie) {
    return res.redirect("/login"); // Redirect to the login page if the user data cookie is not found
  }

  try {
    const transactionId = req.params.id;
    // Fetch the transaction by ID from your data source (e.g., database)
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).send("Transaction not found");
    }
    res.render("edit-transaction", { transaction });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});
app.post("/updateTransaction/:id", async (req, res) => {
  try {
    const transactionId = req.params.id;
    const updatedTransactionData = req.body;
    const { status, amount, userId, coin } = updatedTransactionData;

    // Convert amount to a number
    const parsedAmount = parseFloat(amount);

    // Update the transaction in your data source using the provided data
    await Transaction.updateOne({ _id: transactionId }, updatedTransactionData);

    if (updatedTransactionData.type === "Deposit") {
      if (status === "Approved") {
        // Find the user based on userId
        const user = await User.findOne({ email: userId });
        const bal = user.available + parsedAmount;

        const updatedUser = await User.findOneAndUpdate({ email: userId }, { available: bal }, { new: true });

        console.log("Deposit completed. New balance:", bal);
      }
    } else if (updatedTransactionData.type === "Withdrawal") {
      const user = await User.findOne({ email: userId });
      const bal = user.available - parsedAmount;
      const updatedAcc = await User.findOneAndUpdate({ email: userId }, { available: bal }, { new: true });

      console.log("Withdrawal completed. New balance:", bal);
    }

    res.redirect("/transactions"); // Redirect to transactions list
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

app.post("/deletetr/:id", async (req, res) => {
  try {
    const transactionId = req.params.id;
    // Update the transaction in your data source using the provided data
    await Transaction.deleteOne({ _id: transactionId });

    res.redirect("/transactions"); // Redirect to transactions list
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});
app.get("/edit-user-funds/:id", requireLogin, async (req, res) => {
  const authCookie = req.cookies.auth;

  if (!authCookie) {
    return res.redirect("/login"); // Redirect to the login page if the user data cookie is not found
  }

  try {
    const transactionId = req.params.id;
    // Fetch the transaction by ID from your data source (e.g., database)
    const transaction = await User.findById(transactionId);
    if (!transaction) {
      return res.status(404).send("Transaction not found");
    }
    res.render("edit-user-funds", { transaction });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});
app.post("/update-user-funds/:id", async (req, res) => {
  try {
    const transactionId = req.params.id;
    const updatedTransactionData = req.body;
    // Update the transaction in your data source using the provided data
    await User.updateOne({ _id: transactionId }, updatedTransactionData);
    res.redirect("/transactions"); // Redirect to transactions list
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});
app.get("/add-history", requireLogin, async (req: Request, res: Response) => {
  const authCookie = req.cookies.auth;

  if (!authCookie) {
    return res.redirect("/login"); // Redirect to the login page if the user data cookie is not found
  }

  const auth = JSON.parse(authCookie); // Parse the user data from the cookie
  const users = await User.find();
  const message = "";
  res.render("add-history.ejs", { user: auth, users, message });
});

app.post("/add-history", requireLogin, async (req, res) => {
  const authCookie = req.cookies.auth;
  const { bankName, amount, accNumber, recipientName, recipientBank, userId, status, type, day, month, year } = req.body;
  const dateString = `${day}-${month}-${year}`;

  try {
    const createdAtDate = moment(dateString, 'DD-MM-YYYY').toDate();
    const data = {
      bankName,
      amount,
      accNumber,
      recipientName,
      recipientBank,
      status,
      userId,
      type,
      createdAt: createdAtDate
    };
    const parsedAmount = parseFloat(amount);
    const auth = JSON.parse(authCookie);
    await Transaction.create(data);
    //await Transaction.updateOne({ _id: transactionId }, updatedTransactionData);

    if (data.type === "Deposit") {
      if (status === "Approved") {
        // Find the user based on userId
        const user = await User.findOne({ email: userId });
        const bal = user.available + parsedAmount;

        const updatedUser = await User.findOneAndUpdate({ email: userId }, { available: bal }, { new: true });

        console.log("Deposit completed. New balance:", bal);
      }
    } else if (data.type === "Withdrawal") {
      const user = await User.findOne({ email: userId });
      const bal = user.available - parsedAmount;
      const updatedAcc = await User.findOneAndUpdate({ email: userId }, { available: bal }, { new: true });

    }
    const message = `You have added a history for ${userId}`; // Set the success message

    // Fetch the users again if you need to update the dropdown on the page
    const users = await User.find();

    res.render("add-history.ejs", { user: auth, users, message });
  } catch (err) {
    console.error(err);
    // Handle errors accordingly, you might want to redirect to an error page or show an error message
    res.status(500).send('Internal Server Error');
  }
});
app.post("/support", requireLogin, async (req, res) => {
  const authCookie = req.cookies.auth;
  try {
    const { text, userId, type, createdAt } = req.body;
    const data = {
      text,
      createdAt,
      type,
      userId
    };
    const auth = JSON.parse(authCookie);
    data.userId = auth.email;
    data.createdAt = new Date();
    data.type = "user";
    const save = Message.create(data);
    const messages = await Message.find({ userId: auth.email }).sort({
      createdAt: 1,
    });

    res.render("support.ejs", { user: auth, messages });
  } catch (err) {

  }
})
app.get("/support", requireLogin, async (req: Request, res: Response) => {
  const authCookie = req.cookies.auth;
  const auth = JSON.parse(authCookie);
  const messages = await Message.find({ userId: auth.email }).sort({
    createdAt: 1,
  });

  res.render("support.ejs", { user: auth, messages });
});
app.get('/chats', async (req, res) => {
  try {
    const chats = await Message.find({
      opened: false
    })

    res.render('chats', { chats });
  } catch (error) {
    // Handle error
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.get("/replychats/:userId", requireLogin, async (req, res) => {
  const authCookie = req.cookies.auth;

  if (!authCookie) {
    return res.redirect("/login"); // Redirect to the login page if the user data cookie is not found
  }

  try {
    const messageId = req.params.userId;
    // Fetch the transaction by ID from your data source (e.g., database)
    const messages = await Message.find({ userId: messageId }).sort({
      createdAt: 1,
    });


    if (!messages) {
      return res.status(404).send("message not found");
    }
    const updateResult = await Message.updateMany({ userId: messageId, opened: false }, { $set: { opened: true } });

    res.render("replychats", { messages, messageId });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});
app.get("/settings", requireLogin, async (req: Request, res: Response) => {
  const authCookie = req.cookies.auth;
  const auth = JSON.parse(authCookie);


  res.render("settings.ejs", { user: auth });
});
app.post("/replychats", requireLogin, async (req, res) => {
  const authCookie = req.cookies.auth;
  try {
    const { text, userId, type, opened, createdAt } = req.body;
    const data = {
      text,
      createdAt,
      type,
      opened,
      userId
    };
    const auth = JSON.parse(authCookie);
    const messageId = userId;
    data.createdAt = new Date();
    data.type = "admin";
    data.opened = true;
    const save = Message.create(data);
    const messages = await Message.find({ userId }).sort({
      createdAt: 1,
    });

    res.render("replychats.ejs", { user: auth, messages, messageId });
  } catch (err) {

  }



})
export default app;
