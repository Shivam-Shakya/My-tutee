import "./BestTeachers.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from 'swiper/modules';
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import img1 from '../../assets/teachers/teach1.jpg';
import img2 from '../../assets/teachers/teach2.jpg';
import img3 from '../../assets/teachers/teach3.jpg';
import img4 from '../../assets/teachers/teach4.jpg';
import img5 from '../../assets/teachers/teach5.jpg';

const teachers = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    subject: "Mathematics",
    experience: 15,
    rating: 4.9,
    bioData: "PhD in Mathematics with 15 years of teaching experience. Specializes in calculus and algebra.",
    photo: img1,
  },
  {
    id: 2,
    name: "Prof. Michael Chen",
    subject: "Physics",
    experience: 12,
    rating: 4.8,
    bioData: "Expert in quantum physics and mechanics. Published author of 5 physics textbooks.",
    photo: img2,
  },
  {
    id: 3,
    name: "Ms. Emily Davis",
    subject: "English Literature",
    experience: 10,
    rating: 4.7,
    bioData: "MFA in Literature. Passionate about Shakespeare and modern poetry.",
    photo: img3,
  },
  {
    id: 4,
    name: "Mr. David Wilson",
    subject: "Computer Science",
    experience: 8,
    rating: 4.9,
    bioData: "Software engineer turned educator. Expert in algorithms and web development.",
    photo: img4,
  },
  {
    id: 5,
    name: "Mr. David Wilson",
    subject: "Web Developer",
    experience: 12,
    rating: 4.9,
    bioData: "Web developer turned educator. Expert in algorithms and web development.",
    photo: img5,
  },
];

const BestTeachers = () => {
  return (
    <section id="teachers" className="best-teachers">
      <div className="containers">
        <h2>Meet Our Best Teachers</h2>
        <p className="best-teachers-p">Learn from industry experts and experienced educators</p>

        <div className="best-teachers-carousel">
          <button
            type="button"
            className="teacher-carousel-btn teacher-carousel-prev"
            aria-label="Previous teachers"
          >
            <FiChevronLeft size={20} />
          </button>

          <Swiper
            className="teachers-swiper"
            spaceBetween={24}
            slidesPerView={3}
            loop={true}
            modules={[Navigation, Pagination]}
            navigation={{
              prevEl: '.teacher-carousel-prev',
              nextEl: '.teacher-carousel-next'
            }}
            pagination={{
              clickable: true
            }}
            breakpoints={{
              0: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {teachers.map((teacher) => (
              <SwiperSlide key={teacher.id}>
                <div className="bestteacher-card">
                  <img
                    src={teacher.photo}
                    alt={teacher.name}
                    className="bestteacher-photo"
                  />

                  <div className="bestteacher-info">
                    <h3>{teacher.name}</h3>
                    <p className="subject">{teacher.subject}</p>
                    <p className="experience">
                      {teacher.experience} years experience
                    </p>

                    <div className="rating">
                      {"★".repeat(Math.floor(teacher.rating))}
                      {"☆".repeat(5 - Math.floor(teacher.rating))}
                      <span> ({teacher.rating})</span>
                    </div>

                    <p className="bioData">{teacher.bioData}</p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <button
            type="button"
            className="teacher-carousel-btn teacher-carousel-next"
            aria-label="Next teachers"
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default BestTeachers;
