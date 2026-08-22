import Image from "next/image";
import Title from "./Title";
import fast from "../assets/fast.png";
import customer from "../assets/customer.png";
import trust from "../assets/trust.png";
import secure from "../assets/secure.png";
import responsive from "../assets/responsive.png";
import trick from "../assets/trick.png";
const Card = ({ title, text, icon }) => {
  return (
    <div className="grid grid-cols-1 justify-center items-center w-full bg-blue-50/5 ring-1 ring-blue-200/20 transition-colors text-yeah-text px-5 py-2 mb-10 rounded-lg min-h-[350px]">
      <div className="w-36 mx-auto flex justify-center items-center text-center text-2xl rounded-full p-4">
        <Image src={icon} alt={title} width={100} height={100} />
      </div>
      <p className="font-semibold text-2xl capitalize text-center">{title}</p>
      <p className="font-light text-sm">{text}</p>
    </div>
  );
};
function Chooseus() {
  return (
    <div id="chooseUs" className="scroll-my-14">
      <Title text="Why choose DevGenit?" />
      <div className="columns-1 md:columns-2 lg:columns-3 gap-5 md:gap-10 max-w-7xl w-full">
        <Card
          title={"Fast and Efficient"}
          text={`We understand the importance of speed in today's fast-paced world. Our agile development processes and skilled team ensure rapid delivery of high-quality solutions, helping you stay ahead of the competition.`}
          icon={fast}
        />

        <Card
          title={"Customer-Centric Approach"}
          text={`Your satisfaction is our priority. We pride ourselves on a customer-centric approach, providing support and guidance every step of the way. We're not just a service provider, we're your partner in growth.`}
          icon={customer}
        />
        <Card
          title={"Trustworthy and Transparent"}
          text={
            "We build relationships based on trust and transparency. Our clients rely on us for honest advice, reliable service, and integrity in every interaction. We keep you informed at every stage of your project, ensuring complete clarity and confidence in our partnership."
          }
          icon={trust}
        />
        <Card
          title={"Reliable and Secure"}
          text={
            "Our commitment to reliability and security is unwavering. We implement rigorous testing and quality assurance processes to provide stable and secure systems, giving you peace of mind and confidence in your IT infrastructure."
          }
          icon={secure}
        />
        <Card
          title={"Responsive Design"}
          text={
            " We create websites and applications that provide an optimal user experience across all devices. Whether your customers are on a desktop, tablet, or smartphone, our designs ensure seamless functionality and aesthetics."
          }
          icon={responsive}
        />
        <Card
          title={"Proven Track Record"}
          text={
            "DevGeniT has a proven track record of delivering successful projects and satisfied clients. Our expertise and dedication to excellence have earned us the trust of businesses worldwide."
          }
          icon={trick}
        />
      </div>
    </div>
  );
}

export default Chooseus;
