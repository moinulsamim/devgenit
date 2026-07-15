import Title from "./Title";
import { FaFacebook, FaLinkedin } from "react-icons/fa";
import turya from "/team/tb.png";
import samim from "/team/samim.jpg";
import khalid from "/team/khalid.jpg";
import fatin from "/team/fatin.jpg";
import julius from "/team/julius.jpg";

const profileData = [
  {
    name: "MD. Moinul Hossain Samim",
    photo: samim,
    fbLink: "https://www.facebook.com/hossain.samim.1232",
    inLink: "https://www.linkedin.com/in/md-moinul-hossain-samim-686b77255/",
    stuff: "Founder & CEO",
    disable: false,
  },
  {
    name: "Julius Ahmed",
    photo: julius,
    fbLink: "https://www.facebook.com/lamp.post.5876",
    inLink: "https://www.linkedin.com/in/julius-ahmed-08880890/",
    stuff: "Chief Executive Officer (CEO)",
    disable: true,
  },
  {
    name: "Khalid Ahammed  (Uzzal)",
    photo: khalid,
    fbLink: "https://www.facebook.com/khalid.ahammed.39",
    inLink: "https://www.linkedin.com/in/khalid-ahammed-170041234/",
    stuff: "Chief Operating Officer (COO)",
    disable: false,
  },
  {
    name: "Turya Biswas",
    photo: turya,
    fbLink: "https://facebook.com/Turya.Biswas.012",
    inLink: "https://www.linkedin.com/in/turya-biswas-31418527b/",
    stuff: "Chief Technology Officer (CTO)",
    disable: false,
  },

  {
    name: "Fatin Shadab",
    photo: fatin,
    fbLink: "https://www.facebook.com/fatin.shadab.1",
    inLink: "https://www.linkedin.com/in/fatin-shadab",
    stuff: "Director (R & D)",
    disable: false,
  },
];
function About() {
  return (
    <div className="min-h-screen pt-28 max-w-4xl mx-auto">
      {/* <Title color="bg-orange-500" text="Meet the team" /> */}
      <div className="flex flex-col md:grid grid-cols-2 md:justify-center flex-wrap gap-10 md:px-16 justify-center my-16">
        {profileData.map(
          (ele, id) =>
            !ele.disable && (
              <DevProfile
                key={id}
                name={ele.name}
                photo={ele.photo}
                stuff={ele.stuff}
                fb={ele.fbLink}
                inLink={ele.inLink}
              />
            )
        )}
      </div>
    </div>
  );
}
const DevProfile = ({ name, photo, stuff, fb, inLink }) => {
  return (
    <div className="w-full h-fit mx-auto max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 group">
      <div className="flex justify-end px-4 pt-4"></div>
      <div className="flex flex-col items-center pb-10">
        <img
          className="w-24 h-auto mb-3 rounded-full shadow-lg object-cover  group-hover:w-48 aspect-square transition-all"
          width={200}
          height={200}
          src={photo}
          alt={name}
        />
        <h5 className="mb-1 text-xl p-2 text-center font-medium text-gray-900 dark:text-white">
          {name}
        </h5>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {stuff}
        </span>
        <div className="flex mt-4 md:mt-6 space-x-3">
          <a
            href={fb}
            target="_blank"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white rounded-lg focus:ring-4 focus:outline-none focus:ring-blue-300 bg-blue-600 hover:bg-blue-700 "
          >
            <FaFacebook />
          </a>
          <a
            href={inLink}
            target="_blank"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white rounded-lg focus:ring-4 focus:outline-none focus:ring-blue-300 bg-linkedin hover:bg-linkedin/70"
          >
            <FaLinkedin />
          </a>
        </div>
      </div>
    </div>
  );
};
export default About;
