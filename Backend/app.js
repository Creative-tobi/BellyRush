const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db")
const buyerroute = require("./router/buyer.router");
const adminroute = require("./router/admin.router");
const vendorroute = require("./router/vendor.router");
const deliveryroute = require("./router/delivery.router");
const contactroute = require("./router/contact.router");

dotenv.config();
connectDB();

const PORT = process.env.PORT;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", buyerroute);
app.use("/api", adminroute);
app.use("/api", vendorroute);
app.use("/api", deliveryroute);
app.use("/api", contactroute);




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});