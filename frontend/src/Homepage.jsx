import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import cicken from "/src/media/cicken.jpg";
import { useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import burger from "/src/media/burger.jpg";
import pizza from "/src/media/pizza.jpg";
import shawama from "/src/media/shawama.jpg";
import shoping from "/src/media/shoping.jpg";
import fast from "/src/media/fast.jpg";
import delivery from "/src/media/delivey.jpg";
import vendor from "/src/media/vendor.jpg";
import user from "/src/media/buyer.jpg";


const Homepage = () => {
  const [data, setData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });

  const handleDeliveryRegister = async (e) => {
    e.preventDefault();
    try {
      navigate("/delivery/register");
    } catch (error) {
      error.response && alert(error.response.data.message);
    }
  };

  const handleVendorRegister = async (e) => {
    e.preventDefault();
    try {
      navigate("/vendor/register");
    } catch (error) {
      error.response && alert(error.response.data.message);
    }
  };

  const handleUserRegister = async (e) => {
    e.preventDefault();
    try {
      navigate("/customer/register");
    } catch (error) {
      error.response && alert(error.response.data.message);
    }
  };

  // Scroll effects
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 100], [0, -10]);
  const headerOpacity = useTransform(scrollY, [0, 50], [1, 0.95]);

  return (
    <>
      <motion.section
        className="skeleton min-h-screen bg-neutral-50 "
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}>
        {/* Single Unified Header */}
        <motion.header
          className="bg-white flex justify-between items-center z-50 px-6 py-4 sticky top-0 shadow-md"
          style={{ y: headerY, opacity: headerOpacity }}>
          {/* Logo */}
          <h1 className="text-2xl font-bold text-green-600">BellyRush</h1>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search restaurants, food, or cuisines..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Login Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
            onClick={() => navigate("/customer/login")}>
            <CgProfile /> Log in
          </motion.button>
        </motion.header>

        {/* Hero Section */}
        <motion.section
          className=""
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: false, margin: "" }}>
          <div className="md:flex md:justify-center bg-white py-12 px-4 place-items-center">
            <div className="md:w-150">
              <motion.i
                className="bg-black/70 text-white border-2 border-green-200 rounded-xl text-center px-4 py-2"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: false, margin: "-100px" }}>
                Easy way to order your food 🚴‍♂️
              </motion.i>

              <motion.h1
                className="text-2xl md:text-4xl font-bold py-2"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: false, margin: "-100px" }}>
                Order Healthy and Fresh Food Anytime, Anywhere.
              </motion.h1>
              <motion.p
                className="text-lg md:text-xl text-gray-700"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: false, margin: "-100px" }}>
                When hunger strikes, BellyRush delivers. Fast, fresh, and
                belly-satisfying.
              </motion.p>
            </div>
            <motion.div
              className="hidden md:flex"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: false, margin: "-100px" }}>
              <motion.img
                src={cicken}
                alt="Delicious food"
                className="w-40 h-40 md:w-64 md:h-64"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                whileHover={{
                  scale: 1.1,
                  rotate: [0, 360],
                  transition: { duration: 0.5 },
                }}
              />
            </motion.div>
          </div>
        </motion.section>

        {/* Top Restaurants Section */}
        <motion.section
          className="text-center py-20 px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, margin: "-100px" }}>
          <motion.p
            className="font-semibold text-green-800"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: false, margin: "-100px" }}>
            TOP RESTAURANTS
          </motion.p>
          <motion.h1
            className="text-3xl md:text-4xl font-bold"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: false, margin: "-100px" }}>
            Most Featured Restaurants in BellyRush
          </motion.h1>

          <motion.div
            className="flex flex-wrap justify-center md:grid-cols-3 lg:grid-cols-4 gap-6 py-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: false, margin: "-100px" }}>
            {[
              cicken,
              burger,
              pizza,
              cicken,
              shawama,
              pizza,
              burger,
              shawama,
            ].map((img, index) => (
              <motion.div
                key={index}
                className="place-items-center"
                whileHover={{ y: -10, scale: 1.05 }}
                transition={{ duration: 0.3 }}>
                <motion.img
                  src={img}
                  alt={`restaurant ${index + 1}`}
                  className="rounded-full bg-gray-400 h-24 w-24 md:h-60 md:w-60" // Larger images
                  whileHover={{ rotate: 5 }}
                />
                <motion.p
                  className="text-white bg-black/70 rounded-md py-3 px-4 mt-3 text-sm md:text-base"
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.9)" }}>
                  {index === 0
                    ? "Global food"
                    : index === 1
                    ? "Burger King"
                    : index === 2
                    ? "Pizza Blug"
                    : index === 3
                    ? "Chicken & chips"
                    : index === 4
                    ? "Shawama Vendor"
                    : index === 5
                    ? "Pizza Blug"
                    : index === 6
                    ? "Burger King"
                    : "Shawama Vendor"}
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Why BellyRush Section */}
        <motion.section
          className="text-center px-4 sm:px-6 lg:px-8 py-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, margin: "-100px" }}>
          <motion.p
            className="font-semibold text-green-800"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: false, margin: "-100px" }}>
            WHY BELLYRUSH?
          </motion.p>
          <motion.h1
            className="md:text-4xl text-3xl font-bold"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: false, margin: "-100px" }}>
            Anything Delivered
          </motion.h1>

          <motion.div
            className="flex flex-wrap md:flex-nowrap justify-center gap-6 p-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: false, margin: "-100px" }}>
            {[
              {
                img: delivery,
                title: "Your City's Top Restaurants",
                text: "With a great variety of restaurants you can order your favourite food or explore new restaurants nearby!",
              },
              {
                img: fast,
                title: "Fast Delivery",
                text: "Like a flash! Order or send anything in your city and receive it in minutes",
              },
              {
                img: shoping,
                title: "Groceries Delivery & More!!",
                text: "Find anything you need! From supermarkets to shops, pharmacies to florists — if it's in yourcity order it and receive it.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="md:w-150"
                whileHover={{ y: -10 }}>
                <motion.div
                  className="place-items-center"
                  whileHover={{ scale: 1.1 }}>
                  <motion.img
                    src={item.img}
                    alt="delivery food"
                    className="py-6 px-6 bg-green-200 w-24 h-24 md:w-60 md:h-60" // Larger images
                    style={{ borderRadius: "50% 50% 20% 50%" }}
                    whileHover={{ rotate: 10 }}
                  />
                </motion.div>
                <motion.h1
                  className="text-2xl font-bold mt-4"
                  whileHover={{ color: "#166534" }}>
                  {item.title}
                </motion.h1>
                <motion.p
                  className="text-gray-700 text-lg mt-2"
                  whileHover={{ color: "#166534" }}>
                  {item.text.split(" ").map((word, i) =>
                    word.includes("explore") ||
                    word.includes("receive") ||
                    word.includes("supermarkets") ? (
                      <font
                        key={i}
                        className="px-2 font-semibold py-1 bg-green-200 rounded-xl">
                        {word}{" "}
                      </font>
                    ) : (
                      word + " "
                    )
                  )}
                </motion.p>
              </motion.div>
            ))}
          </motion.div>

          <motion.button
            className="bg-green-950 font-bold p-4 rounded-full text-green-50 mt-8"
            whileHover={{ scale: 1.05, backgroundColor: "#166534" }}
            whileTap={{ scale: 0.95 }}>
            Explore stores around you
          </motion.button>
        </motion.section>

        {/* Countries Section */}
        <motion.section
          className="text-center px-4 sm:px-6 lg:px-8 py-20 z-0 bg-green-950"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, margin: "-100px" }}>
          <motion.p
            className="font-semibold text-green-800"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: false, margin: "-100px" }}>
            WHY BELLYRUSH?
          </motion.p>
          <motion.h1
            className="text-4xl font-bold text-green-50 clip-wave"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: false, margin: "-100px" }}>
            Countries We Deliver
          </motion.h1>

          <motion.div
            className="flex flex-wrap justify-center gap-4 p-6 text-green-50"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: false, margin: "-100px" }}>
            {[
              "Spain",
              "Nigeria",
              "Ghana",
              "Canada",
              "Portugal",
              "Russia",
              "Ukraine",
              "Palestine",
            ].map((country, index) => (
              <motion.div
                key={index}
                className="bg-neutral-50 text-green-950 font-semibold hover:bg-green-100/50 rounded-full px-4 py-3 md:px-6 md:py-3"
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.95 }}>
                {country}
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Customer Testimonials */}
        <motion.section
          className="text-center px-4 sm:px-6 lg:px-8 py-20 bg-gray-50"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, margin: "-100px" }}>
          <motion.p
            className="font-semibold text-green-800"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: false, margin: "-100px" }}>
            WHY BELLYRUSH?
          </motion.p>
          <motion.h1
            className="text-4xl font-bold"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: false, margin: "-100px" }}>
            Customer Says
          </motion.h1>

          <motion.div
            className="flex flex-wrap md:flex-nowrap justify-center gap-8 p-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: false, margin: "-100px" }}>
            {[
              {
                img: "/hotfood.jpg",
                name: "Jane Doe",
                quote:
                  "BellyRush has transformed the way I order food. The variety of restaurants and the speed of delivery are unmatched!",
              },
              {
                img: "/hotfood.jpg",
                name: "John Smith",
                quote:
                  "I love how easy it is to use BellyRush. The app is user-friendly, and I can track my order in real-time. Highly recommend!",
              },
              {
                img: "/hotfood.jpg",
                name: "Emily Johnson",
                quote:
                  "The customer service at BellyRush is exceptional. They resolved my issue quickly and made sure I was satisfied. Five stars!",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="place-items-center md:w-80"
                whileHover={{ y: -10 }}>
                <motion.div whileHover={{ scale: 1.1 }}>
                  <motion.img
                    src={testimonial.img}
                    alt={`customer ${index + 1}`}
                    className="py-6 px-6 bg-green-200 w-24 h-24 md:w-60 md:h-60" // Larger images
                    style={{ borderRadius: "50% 50% 20% 50%" }}
                  />
                </motion.div>
                <motion.h1
                  className="text-2xl font-bold mt-4"
                  whileHover={{ color: "#166534" }}>
                  {testimonial.name}
                </motion.h1>
                <motion.p
                  className="text-gray-700 text-lg py-3 pb-4"
                  whileHover={{ color: "#166534" }}>
                  "{testimonial.quote}"
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="text-center px-4 sm:px-6 lg:px-8 py-20 bg-green-100"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, margin: "-100px" }}>
          <motion.p
            className="font-semibold text-green-800"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: false, margin: "-100px" }}>
            Trust us?
          </motion.p>
          <motion.h1
            className="text-4xl font-bold"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: false, margin: "-100px" }}>
            Let's Do it Together
          </motion.h1>

          <motion.div
            className="flex flex-wrap md:flex-nowrap justify-center gap-8 p-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: false, margin: "-100px" }}>
            {[
              {
                img: fast,
                title: "Become a Rider",
                text: "Enjoy flexibility, freedom and competitive earnings by delivering through BellyRush.",
                handler: handleDeliveryRegister,
                btnText: "Register as a Rider",
              },
              {
                img: vendor,
                title: "Become a Partner",
                text: "Grow with BellyRush! Our technology and user base can help you boost sales and unlock new opportunities!",
                handler: handleVendorRegister,
                btnText: "Register as a Partner",
              },
              {
                img: user,
                title: "Become a User",
                text: "Ready for an exciting new challenge? If you’re ambitious, humble, and love working with others, then we want to hear from you!",
                handler: handleUserRegister,
                btnText: "Register as a User",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="place-items-center md:w-80"
                whileHover={{ y: -10 }}>
                <motion.div whileHover={{ scale: 1.1 }}>
                  <motion.img
                    src={item.img}
                    alt={`option ${index + 1}`}
                    className="py-6 px-6 bg-green-200 w-24 h-24 md:w-60 md:h-60" // Larger images
                    style={{ borderRadius: "50% 50% 20% 50%" }}
                  />
                </motion.div>
                <motion.h1
                  className="text-2xl font-bold mt-4"
                  whileHover={{ color: "#166534" }}>
                  {item.title}
                </motion.h1>
                <motion.p
                  className="text-gray-700 text-lg py-3 pb-4"
                  whileHover={{ color: "#166534" }}>
                  {item.text}
                </motion.p>
                <motion.button
                  className="bg-green-950 font-bold p-4 rounded-full text-green-50"
                  whileHover={{ scale: 1.05, backgroundColor: "#166534" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={item.handler}>
                  {item.btnText}
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      </motion.section>

      <motion.footer
        className="bg-black text-white text-center p-6"
        initial={{ opacity: 1, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: false, margin: "" }}>
        &copy; {new Date().getFullYear()} BellyRush. All rights reserved.
      </motion.footer>
    </>
  );
};

export default Homepage;
