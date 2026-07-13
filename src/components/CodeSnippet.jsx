import React from "react";

function CodeSnippet() {
  return (
    <pre
      className={`px-4 pb-2 pt-4 rounded-lg w-fit bg-slate-900/20 ring-1 ring-slate-50 backdrop-blur-md text-white overflow-hidden  fixed -right-32 top-4 z-50`}
    >
      <div className="absolute w-full h-7 bg-slate-500/30 left-0 top-0">
        <span className="absolute w-2 h-2 rounded-full bg-rose-500 top-3 left-4"></span>
        <span className="absolute w-2 h-2 rounded-full bg-yellow-500 top-3 left-8"></span>
        <span className="absolute w-2 h-2 rounded-full bg-green-500 top-3 left-12"></span>
      </div>
      {`
function CodeSnippet() {
  return (
    <p>
      <div className="absolute w-full h-7 bg-slate-500/30 left-0 top-0">
        <span className="absolute w-2 h-2 rounded-full bg-rose-500 top-3 left-4"></span>
        <span className="absolute w-2 h-2 rounded-full bg-yellow-500 top-3 left-8"></span>
        <span className="absolute w-2 h-2 rounded-full bg-green-500 top-3 left-12"></span>
      </div>
      
    </p>
  );
}
      `}
    </pre>

    // eita holo ekta template for Coding style text
  );
}

export default CodeSnippet;
