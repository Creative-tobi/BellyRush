// import React from 'react'
import { useState } from "react";
import cicken from "/src/media/cicken.jpg";
import { useNavigate } from "react-router-dom";
import videopreview from "/src/media/food.mp4";
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
      error.response &&
            alert(error.response.data.message);
    }
  };

  const handleVendorRegister = async (e) => {
    e.preventDefault();

    try {
      navigate("/vendor/register");
    } catch (error) {
      error.response &&
            alert(error.response.data.message);
    }
  };

  
  const handleUserRegister = async (e) => {
    e.preventDefault();

    try {
      navigate("/customer/register");
    } catch (error) {
      error.response &&
            alert(error.response.data.message);
    }
  };
  return (
    <>
      <section className="min-h-screen bg-neutral-50">
        <nav className="bg-white flex justify-around md:justify-between z-1 px-6 py-6 sticky top-0 shadow-md">
          <h1 className="text-xl font-montserrat font-bold">BellyRush </h1>
          <button
            className="bg-green-800 rounded-xl text-white py-2 px-6 flex place-items-center gap-2"
            onClick={() => navigate("/customer/login")}>
            <CgProfile /> Log in
          </button>
        </nav>
        <section className="">
          {" "}
          <div className="md:flex md:justify-center bg-white pt-6 px-4 place-items-center">
            <div className="md:w-150">
              <i className="bg-black/70 text-white border-2 border-green-200 rounded-xl text-center px-4 py-2">
                Easy way to order your food 🚴‍♂️
              </i>

              <h1 className="text-3xl md:text-5xl font-bold py-4">
                Order Healthy and Fresh Food Anytime, Anywhere.
              </h1>
              <p className="text-lg md:text-xl text-gray-700">
                When hunger strikes, BellyRush delivers. Fast, fresh, and
                belly-satisfying.
              </p>

              <div className="border-1 border-green-950 bg-white w-74 md:w-full rounded-xl flex md:justify-between my-8 md:h-13">
                <input
                  type="text"
                  placeholder="Delivery address"
                  className="border-none outline-none px-4"
                />
                <button className="bg-black rounded-lg text-white py-2 px-4 md:px-8">
                  Search
                </button>
              </div>
            </div>
            <div className="hidden md:flex">
              <img
                src={cicken}
                alt="rotating"
                className="w-32 h-32 animate-spin-fast h-100 w-100 "
              />
            </div>
          </div>
        </section>
        <section className="text-center py-20">
          <p className="font-semibold text-green-800">TOP RESTAURANTS</p>
          <h1 className="text-3xl md:text-4xl font-bold">
            Most Featured Restaurants in BellyRush
          </h1>
          <div className="flex flex-wrap justify-center md:grid-cols-3 lg:grid-cols-4 gap-6 px-6 py-6">
            <div className="place-items-center">
              <img
                src={cicken}
                alt="chicken rice"
                className="rounded-full bg-gray-400 h-50 w-50"
              />
              <p className="text-white bg-black/70 rounded-md py-2 px-4">
                Global food
              </p>
            </div>

            <div className="place-items-center">
              <img
                src={burger}
                alt="chicken rice"
                className="rounded-full h-50 w-50"
              />
              <p className="text-white bg-black/70 rounded-md py-2 px-4">
                Burger King
              </p>
            </div>

            <div className="place-items-center">
              <img
                src={pizza}
                alt="chicken rice"
                className="rounded-full h-50 w-50"
              />
              <p className="text-white bg-black/70 rounded-md py-2 px-4">
                Pizza Blug
              </p>
            </div>

            <div className="place-items-center">
              <img
                src={cicken}
                alt="chicken rice"
                className="rounded-full bg-gray-400 h-50 w-50"
              />
              <p className="text-white bg-black/70 rounded-md py-2 px-4">
                Chicken & chips
              </p>
            </div>

            <div className="place-items-center">
              <img
                src={shawama}
                alt="chicken rice"
                className="rounded-full h-50 w-50"
              />
              <p className="text-white bg-black/70 rounded-md py-2 px-4">
                Shawama Vendor
              </p>
            </div>

            <div className="place-items-center">
              <img
                src={pizza}
                alt="chicken rice"
                className="rounded-full h-50 w-50"
              />
              <p className="text-white bg-black/70 rounded-md py-2 px-4">
                Pizza Blug
              </p>
            </div>

            <div className="place-items-center">
              <img
                src={burger}
                alt="chicken rice"
                className="rounded-full h-50 w-50"
              />
              <p className="text-white bg-black/70 rounded-md py-2 px-4">
                Burger King
              </p>
            </div>

            <div className="place-items-center">
              <img
                src="/src/media/shawama.jpg"
                alt="chicken rice"
                className="rounded-full h-50 w-50"
              />
              <p className="text-white bg-black/70 rounded-md py-2 px-4">
                Shawama Vendor
              </p>
            </div>
          </div>
        </section>

        <section className="text-center px-6 py-20">
          <p className="font-semibold text-green-800">WHY BELLYRUSH?</p>
          <h1 className="md:text-4xl text-3xl font-bold">Anything Delivered</h1>
          <div className="flex flex-wrap md:flex-nowrap justify-center gap-6 p-6">
            <div className="md:w-150">
              <div className="place-items-center">
                <img
                  src={delivery}
                  alt="delivery food"
                  className="py-6 px-6 bg-green-200 w-50 h-50"
                  style={{ borderRadius: "50% 50% 20% 50%" }}
                />
              </div>
              <h1 className="text-2xl font-bold">
                Your City's Top Restaurants
              </h1>
              <p className="text-gray-700 text-lg">
                With a great variety of restaurants you can order your favourite
                food or{" "}
                <font className="px-2 font-semibold py-1 bg-green-200 rounded-xl">
                  explore new restaurants nearby!
                </font>
              </p>
            </div>

            <div className="md:w-150">
              <div className="place-items-center">
                <img
                  src={fast}
                  alt="delivery food"
                  className="py-6 px-6 bg-green-200 w-50 h-50"
                  style={{ borderRadius: "50% 50% 20% 50%" }}
                />
              </div>
              <h1 className="text-2xl font-bold">Fast Delivery</h1>
              <p className="text-gray-700 text-lg">
                Like a flash! Order or send anything in your city and{" "}
                <font className="px-2 font-semibold py-1 bg-green-200 rounded-xl">
                  receive it in minutes
                </font>
              </p>
            </div>

            <div className="md:w-150">
              <div className="place-items-center">
                <img
                  src={shoping}
                  alt="delivery food"
                  className="py-6 px-6 bg-green-200 w-50 h-50"
                  style={{ borderRadius: "50% 50% 20% 50%" }}
                />
              </div>
              <h1 className="text-2xl font-bold">
                Groceries Delivery & More!!
              </h1>
              <p className="text-gray-700 text-lg">
                Find anything you need! From{" "}
                <font className="px-2 font-semibold py-1 bg-green-200 rounded-xl">
                  supermarkets to shops, pharmacies to florists
                </font>{" "}
                — if it's in yourcity order it and receive it.
              </p>
            </div>
          </div>
          <button className="bg-green-950 font-bold p-4 rounded-full text-green-50">
            Explore stores around you
          </button>
        </section>

        <section className="text-center px-6 py-20 z-0 bg-green-950 clip-wave-bottom clip-wave">
          <p className="font-semibold text-green-800">WHY BELLYRUSH?</p>
          <h1 className="text-4xl font-bold text-green-50">
            Countries We Deliver
          </h1>
          <div className="flex flex-wrap justify-center gap-6 p-6 text-green-50">
            <div className="bg-neutral-50 text-green-950 font-semibold hover:bg-green-100/50 rounded-full px-6 py-2">
              Spain
            </div>
            <div className="bg-neutral-50 text-green-950 font-semibold hover:bg-green-100/50 rounded-full px-6 py-2">
              NIgeria
            </div>
            <div className="bg-neutral-50 text-green-950 font-semibold hover:bg-green-100/50 rounded-full px-6 py-2">
              Ghana
            </div>
            <div className="bg-neutral-50 text-green-950 font-semibold hover:bg-green-100/50 rounded-full px-6 py-2">
              Canada
            </div>
            <div className="bg-neutral-50 text-green-950 font-semibold hover:bg-green-100/50 rounded-full px-6 py-2">
              Portugal
            </div>
            <div className="bg-neutral-50 text-green-950 font-semibold hover:bg-green-100/50 rounded-full px-6 py-2">
              Russia
            </div>
            <div className="bg-neutral-50 text-green-950 font-semibold hover:bg-green-100/50 rounded-full px-6 py-2">
              Ukraine
            </div>
            <div className="bg-neutral-50 text-green-950 font-semibold hover:bg-green-100/50 rounded-full px-6 py-2">
              Palestine
            </div>
            <div className="bg-neutral-50 text-green-950 font-semibold hover:bg-green-100/50 rounded-full px-6 py-2">
              Ghana
            </div>
            <div className="bg-neutral-50 text-green-950 font-semibold hover:bg-green-100/50 rounded-full px-6 py-2">
              Canada
            </div>
            <div className="bg-neutral-50 text-green-950 font-semibold hover:bg-green-100/50 rounded-full px-6 py-2">
              Portugal
            </div>
            <div className="bg-neutral-50 text-green-950 font-semibold hover:bg-green-100/50 rounded-full px-6 py-2">
              Russia
            </div>
            <div className="bg-neutral-50 text-green-950 font-semibold hover:bg-green-100/50 rounded-full px-6 py-2">
              Ukraine
            </div>
            <div className="bg-neutral-50 text-green-950 font-semibold hover:bg-green-100/50 rounded-full px-6 py-2">
              Palestine
            </div>
          </div>
        </section>

        <section className="text-center px-6 py-20 bg-gray-50">
          <p className="font-semibold text-green-800">WHY BELLYRUSH?</p>
          <h1 className="text-4xl font-bold">Customer Says</h1>
          <div className="flex flex-wrap md:flex-nowrap justify-center gap-6 p-6">
            <div className="place-items-center md:w-150">
              <div>
                <img
                  src="/src/media/customer1.jpg"
                  alt="customer 1"
                  className="py-6 px-6 bg-green-200 w-50 h-50"
                  style={{ borderRadius: "50% 50% 20% 50%" }}
                />
              </div>
              <h1 className="text-2xl font-bold">Jane Doe</h1>
              <p className="text-gray-700 text-lg py-2 pb-4">
                "BellyRush has transformed the way I order food. The variety of
                restaurants and the speed of delivery are unmatched!"
              </p>
            </div>
            <div className="place-items-center md:w-150">
              <div>
                <img
                  src="/src/media/customer2.jpg"
                  alt="customer 2"
                  className="py-6 px-6 bg-green-200 w-50 h-50"
                  style={{ borderRadius: "50% 50% 20% 50%" }}
                />
              </div>
              <h1 className="text-2xl font-bold">John Smith</h1>
              <p className="text-gray-700 text-lg py-2 pb-4">
                "I love how easy it is to use BellyRush. The app is
                user-friendly, and I can track my order in real-time. Highly
                recommend!"
              </p>
            </div>
            <div className="place-items-center md:w-150">
              <div>
                <img
                  src="/src/media/customer3.jpg"
                  alt="customer 3"
                  className="py-6 px-6 bg-green-200 w-50 h-50"
                  style={{ borderRadius: "50% 50% 20% 50%" }}
                />
              </div>
              <h1 className="text-2xl font-bold">Emily Johnson</h1>
              <p className="text-gray-700 text-lg py-2 pb-4">
                "The customer service at BellyRush is exceptional. They resolved
                my issue quickly and made sure I was satisfied. Five stars!"
              </p>
            </div>
          </div>
        </section>

        <section className="text-center px-6 py-20 bg-green-100 ">
          <p className="font-semibold text-green-800">Trust us?</p>
          <h1 className="text-4xl font-bold">Let's Do it Together</h1>
          <div className="flex flex-wrap md:flex-nowrap justify-center gap-6 p-6">
            <div className="place-items-center">
              <div>
                <img
                  src={fast}
                  alt="delivery man"
                  className="py-6 px-6 bg-green-200 w-50 h-50"
                  style={{ borderRadius: "50% 50% 20% 50%" }}
                />
              </div>
              <h1 className="text-2xl font-bold">Become a Rider</h1>
              <p className="text-gray-700 text-lg py-2 pb-4">
                Enjoy flexibility, freedom and competitive earnings by
                delivering through BellyRush.
              </p>
              <button
                className="bg-green-950 font-bold p-4 rounded-full text-green-50"
                onClick={handleDeliveryRegister}>
                Register as a Rider
              </button>
            </div>

            <div className="place-items-center">
              <div>
                <img
                  src={vendor}
                  alt="a chef preparing food"
                  className="py-6 px-6 bg-green-200 w-50 h-50"
                  style={{ borderRadius: "50% 50% 20% 50%" }}
                />
              </div>
              <h1 className="text-2xl font-bold">Become a Partner</h1>
              <p className="text-gray-700 text-lg py-2 pb-4">
                Grow with BellyRush! Our technology and user base can help you
                boost sales and unlock new opportunities!
              </p>
              <button
                className="bg-green-950 font-bold p-4 rounded-full text-green-50"
                onClick={handleVendorRegister}>
                Register as a Partner
              </button>
            </div>

            <div className="place-items-center">
              <div>
                <img
                  src={user}
                  alt="a customer about to order food"
                  className="py-6 px-6 bg-green-200 w-50 h-50"
                  style={{ borderRadius: "50% 50% 20% 50%" }}
                />
              </div>
              <h1 className="text-2xl font-bold">Become a User</h1>
              <p className="text-gray-700 text-lg py-2 pb-4">
                Ready for an exciting new challenge? If you’re ambitious,
                humble, and love working with others, then we want to hear from
                you!
              </p>
              <button
                className="bg-green-950 font-bold p-4 rounded-full text-green-50"
                onClick={handleUserRegister}>
                Register as a User
              </button>
            </div>
          </div>
        </section>
      </section>
      <footer className="bg-black text-white text-center p-6">
        &copy; {new Date().getFullYear()} BellyRush. All rights reserved.
      </footer>
    </>
  );
};

export default Homepage;
