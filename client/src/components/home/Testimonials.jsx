import React from "react";
import "./Testimonials.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const testimonials = [
  {
    id: 1,
    name: "Aarav Sharma",
    role: "Student",
    rating: 5,
    review:
      "My confidence in math improved within weeks. The classes feel interactive and every doubt is solved with patience.",
    image: "https://i.pravatar.cc/150?img=11",
  },
  {
    id: 2,
    name: "Priya Verma",
    role: "Parent",
    rating: 5,
    review:
      "My daughter looks forward to each session now. The tutor shares clear progress updates and learning plans every week.",
    image: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: 3,
    name: "Rohit Kumar",
    role: "Student",
    rating: 5,
    review:
      "The personalized approach helped me focus on weak topics. I finally enjoy science classes instead of avoiding them.",
    image: "https://i.pravatar.cc/150?img=13",
  },
  {
    id: 4,
    name: "Neha Singh",
    role: "Parent",
    rating: 5,
    review:
      "We were searching for quality online classes and found MyTutee. The mentor quality and class discipline are excellent.",
    image: "https://i.pravatar.cc/150?img=14",
  },
  {
    id: 5,
    name: "Ankit Patel",
    role: "Student",
    rating: 4,
    review:
      "Classes are practical and engaging. I get one-on-one guidance and regular feedback after every test.",
    image: "https://i.pravatar.cc/150?img=15",
  },
  {
    id: 6,
    name: "Sneha Gupta",
    role: "Parent",
    rating: 5,
    review:
      "The tutor understood my son's pace and built a plan around it. We can clearly see measurable academic growth.",
    image: "https://i.pravatar.cc/150?img=16",
  },
];

const BestTestimonials = () => {
  return (
    <section className="testimonials" id="testimonials">
      <div className="testimonials-layout">
        <div className="testimonials-copy">
          <h2>What Our Students & Parents Say</h2>
          <p className="subtitle">
            Hear how MyTutee builds trust with quality education, dedicated mentors, and a positive learning experience for every learner.
          </p>
          <p className="testimonials-cta-text">Join thousands of happy learners</p>
        </div>

        <div className="testimonials-carousel-wrap">
          <div className="testimonials-nav">
            <button className="testimonials-nav-btn testimonials-prev" aria-label="Previous testimonial" type="button">
              &lt;
            </button>
            <button className="testimonials-nav-btn testimonials-next" aria-label="Next testimonial" type="button">
              &gt;
            </button>
          </div>

          <Swiper
            spaceBetween={18}
            speed={700}
            loop={true}
            autoplay={{
              delay: 3200,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation={{
              prevEl: ".testimonials-prev",
              nextEl: ".testimonials-next",
            }}
            pagination={{ clickable: true }}
            modules={[Autoplay, Navigation, Pagination]}
            breakpoints={{
              0: { slidesPerView: 1 },
              680: { slidesPerView: 1 },
              900: { slidesPerView: 1.1 },
              1200: { slidesPerView: 1.25 },
            }}
          >
            {testimonials.map((item) => (
              <SwiperSlide key={item.id}>
                <article className="testimonial-card">
                  <img src={item.image} alt={`${item.name} profile`} />

                  <h3>{item.name}</h3>
                  <span className="role">{item.role}</span>

                  <div className="stars" aria-label={`${item.rating} star rating`}>
                    {"★".repeat(item.rating)}
                    {"☆".repeat(5 - item.rating)}
                  </div>

                  <p className="review">"{item.review}"</p>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default BestTestimonials;
