import Chooseus from "../components/Chooseus";
import Clients from "../components/Clients";
import Header from "../components/Header";
import Technology from "../components/Technology";
import Service from "../components/Service";

const Home = () => {
  return (
    <div className="w-full my-32 px-6">
      <div className="mx-auto max-w-7xl">
        <Header />
        <Service />
        <Clients />
        <Technology />
        <Chooseus />
      </div>
    </div>
  );
};
export default Home;
