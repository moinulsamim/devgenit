function Title({ text = "", color = "bg-rose-600" }) {
  return (
    <div className="title py-5 mb-20">
      <h2 className="font-semibold text-center text-3xl font-sans">
        <p
          // className={`relative w-fit mx-auto after:absolute after:w-full after:h-0.5 after:bg-gradient-to-r after:from-transparent after:${color} after:to-transparent after:left-0 after:-bottom-2 after:rounded-full capitalize overflow-hidden py-2`}
          className="relative w-fit mx-auto text-center py-2 overflow-hidden"
        >
          {text}
          {/* <span
            className={`absolute w-full h-0.5 bg-gradient-to-r from-transparent ${color} to-transparent left-0 rounded-full z-20`}
          ></span> */}

          <span className={`${color} w-full h-0.5 absolute left-0 bottom-0 z-10 rounded-full anim-bounce`}>

          </span>
        </p>
      </h2>
    </div>
  );
}

export default Title;
