type TagProps = {
  onClick?: () => void;
  text: string;
  canRemove: boolean;
};

// Define a fixed palette of Tailwind background classes
const tagColors = [
  "bg-red-100",
  "bg-yellow-100",
  "bg-green-100",
  "bg-blue-100",
  "bg-indigo-100",
  "bg-pink-100",
  "bg-teal-100",
];

// Hash the tag text into a number, then map to a color index
const getColorFromText = (text: string): string => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % tagColors.length;
  return tagColors[index];
};

const Tag = ({ onClick, text, canRemove }: TagProps) => {
  const colorClass = getColorFromText(text);
  if (canRemove) {
    return (
        <span key={text} className={`${colorClass} px-2 py-0.5 rounded text-sm flex items-center`}>
                {text}
                <button
                  type="button"
                  className="ml-1"
                  onClick={onClick}
                >
                  &times;
                </button>
              </span>
    )
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${colorClass} px-2 py-0.5 my-1 rounded text-sm`}
    >
      {text}
    </button>
  );
};

export default Tag;
