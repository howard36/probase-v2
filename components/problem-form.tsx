const subjects = [
  "Algebra",
  "Combinatorics",
  "Geometry",
  "Number Theory",
];

export default function ProblemForm({ collection, problem }) {
  return (
    <div className="container px-6 py-12 mx-auto flex">
      <div className="bg-white rounded-lg p-8 flex flex-col w-full relative z-10 shadow-md">
        <div className="relative mb-4">
          <label className="leading-7 text-md text-gray-600">Title</label>
          <input id="title" name="title" defaultValue={problem?.title} className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"></input>
        </div>
        <div className="relative mb-4">
          <label className="leading-7 text-md text-gray-600">Subject</label>
          <select id="subject" name="subject" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
            {subjects.map(subject => <option defaultValue={subject} selected={subject == problem?.subject}>{subject}</option>)}
          </select>
        </div>
        <div className="relative mb-4">
          <label className="leading-7 text-md text-gray-600">Problem Statement</label>
          <textarea id="statement" name="statement" defaultValue={problem?.statement} className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"></textarea>
        </div>
        <div className="relative mb-4">
          <label className="leading-7 text-md text-gray-600">Answer</label>
          <input id="answer" name="answer" defaultValue={problem?.answer} className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"></input>
        </div>
        <div className="relative mb-4">
          <label className="leading-7 text-md text-gray-600">Solution</label>
          <textarea id="solution" name="solution" defaultValue={problem?.solution} className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"></textarea>
        </div>
        <button className="text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg">Submit</button>
      </div>
    </div>
  );
}
