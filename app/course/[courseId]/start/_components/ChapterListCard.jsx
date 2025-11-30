import { HiOutlineClock } from "react-icons/hi";

const ChapterListCard = ({ ch, i }) => {
  return (
    <div
      className="grid grid-cols-5 items-center py-4 px-5 border-b-2 border-fuchsia-200 hover:border-fuchsia-500 transition-all duration-300 group"
    >
      {/* Index Badge */}
      <div className="flex justify-center pr-2 border-r-2 border-fuchsia-200 group-hover:border-fuchsia-500">
        <h2 className="flex items-center justify-center text-lg font-semibold bg-fuchsia-700 text-white rounded-full w-9 h-9 shadow-md">
          {i + 1}
        </h2>
      </div>

      {/* Chapter Info */}
      <div className="col-span-4 pl-4">
        <h2 className="font-semibold text-gray-800 text-[17px] tracking-wide group-hover:text-fuchsia-700 transition cols-span-4">
          {ch.chapter_name}
        </h2>
        <div className="flex items-center gap-2 mt-1 text-gray-600 text-sm">
          <HiOutlineClock className="text-fuchsia-700" />
          <span>{ch.duration}</span>
        </div>
      </div>
    </div>
  );
};

export default ChapterListCard;
