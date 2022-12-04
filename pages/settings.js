import Image from "next/image";
import UnderConstruction from "../components/images/under-construction.png";

function Settings() {
  return (
    <div className="p-10 h-full">
      <div className="flex justify-center items-center h-full">
        <div>
          <div>
            <Image src={UnderConstruction} alt="under-construction" />
          </div>
          <div className="text-lg text-gray-600 flex justify-center mt-10">
            This page is under construction
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
