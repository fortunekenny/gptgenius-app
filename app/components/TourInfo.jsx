"use client";

const TourInfo = ({ tour, tokens }) => {
  if (!tour) {
    return <p>No tour data available.</p>;
  }
  const { title, description, stops } = tour;
  return (
    <div className="max-w-2xl">
      <h1 className="text-4xl font-semibold mb-4">{title}</h1>
      <p className="leading-loose mb-6">{description}</p>
      <ul>
        {stops.map((stop) => (
          <li key={stop} className="mb-4 bg-base-100 p-4 rounded-xl">
            <p className="text">{stop}</p>
          </li>
        ))}
      </ul>
      {tokens ? (
        <p className="text-end text-xs">{tokens} tokens used.</p>
      ) : null}
    </div>
  );
};

export default TourInfo;
