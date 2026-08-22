import Title from "./Title";
import Image from "next/image";
import root from "../assets/root.png";
import chem from "../assets/chemigen.jpeg";
import mathflix from "../assets/mathflix.png";
import ground from "../assets/ground.png";
import skillshikho from "../assets/skillshikho.png";
import falconyx from "../assets/falconyx.png";
import acs from "../assets/acs.png";

function Clients() {
  const clients = [
    {
      src: falconyx,
      link: "https://falconyxproperties.com/",
      hasBg: false,
    },
    {
      src: skillshikho,
      link: "https://skillshikho.com/",
      hasBg: false,
    },
    {
      src: acs,
      link: "https://acsduyouthsummit2025.org/",
      hasBg: false,
    },
    { src: chem, link: "https://chemgenie.app/", hasBg: false },

    {
      src: ground,
      link: "https://groundwaterltd.com.bd/",
      hasBg: false,
    },
    { src: mathflix,
      link: "https://www.facebook.com/profile.php?id=61564442487543", 
      hasBg: true ,
    },
    {
      src: root,
      link: "https://www.facebook.com/learnfromroots",
      hasBg: false,
    },
  ];
  const Card = ({ src, link, hasBg }) => {
    return (
      <div
        className={`w-36 h-36 relative aspect-square rounded-2xl shadow-lg shadow-gray-500 p-2 group ${
          hasBg ? "bg-red-600 rounded-xl" : "bg-white"
        } flex justify-center items-center hover:-translate-y-2 transition-transform`}
      >
        <Image
          className="select-none px-2"
          src={src}
          alt="Client logo"
          width={120}
          height={120}
          draggable={false}
        />
        {link !== "#" && (
          <div className="absolute inset-0 rounded-xl transition-colors hover:bg-black/60 group-hover:opacity-100 opacity-0 flex justify-center items-center">
            <a href={link} target="_blank">
              <span className="px-4 py-2 border-2 border-white rounded-sm">
                Visit
              </span>
            </a>
          </div>
        )}
      </div>
    );
  };
  return (
    <div className="my-48">
      <Title text="Our clients" color="bg-blue-500" />

      <div className="flex flex-wrap gap-10 items-center justify-center  bg-slate-800/10 ring-1 ring-blue-200/20 rounded-2xl p-20 max-w-7xl mx-auto">
        {clients.map((client, id) => (
          <Card key={id} {...client} /> // na
        ))}
      </div>
    </div>
  );
}

export default Clients;
