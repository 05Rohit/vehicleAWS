import React, { useState, useEffect } from "react";
import CarouselPageStyle from "../../Css/homePageBanner.module.css";

const slides = [
  {
    image: "https://bykemania.com/bootstrapimages/slider1.png",
    title: "Well maintained",
    text: "Our bikes maintained so well you will feel they are brand new!",
  },
  {
    image: "https://bykemania.com/bootstrapimages/slider3.png",
    title: "Home delivery",
    text: "Get the motorbikes you love home delivered with one click.",
  },
  {
    image: "https://bykemania.com/bootstrapimages/slider5.png",
    title: "Wallet friendly",
    text: "Get best price on a wide variety of motorbikes.",
  },
  {
    image: "https://bykemania.com/bootstrapimages/slider2.png",
    title: "Road-side assistance",
    text: "24x7 helpline & dedicated team for roadside assistance.",
  },
  {
    image: "https://bykemania.com/bootstrapimages/slider4.png",
    title: "Insured rides",
    text: "All documents are available on Bykemania mobile app at your fingertips.",
  },
];

const CarouselComponent = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) =>
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // change every 5 sec

    return () => clearInterval(interval);
  }, []);

  return (
    <section className={CarouselPageStyle.slider_MainContainer}>
      <div className={CarouselPageStyle.container}>
        <div className={CarouselPageStyle.Carousel_MainBox}>
          <div className={CarouselPageStyle.Carousel_ButtonContainer}>
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={
                  idx === activeIndex ? CarouselPageStyle.activeButton : ""
                }
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className={CarouselPageStyle.Carousel_ContentContainer}>
            <div
              key={activeIndex}
              className={`${CarouselPageStyle.carousel_item} ${CarouselPageStyle.carousel_item_animated}`}
            >
              <div className={CarouselPageStyle.Carousel_InnerContainer}>
                <div
                  className={CarouselPageStyle.Carousel_Inner_ImageContainer}
                >
                  <img
                    src={slides[activeIndex].image}
                    alt={slides[activeIndex].title}
                  />
                </div>
                <div className={CarouselPageStyle.Carousel_Inner_TextContainer}>
                  <h5>Why riders love Go Gear?</h5>
                  <h2>{slides[activeIndex].title}</h2>
                  <p>{slides[activeIndex].text}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarouselComponent;
