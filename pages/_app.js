import Link from "next/link";
import RectangleGroup from "../components/icons/RectangleGroup";
import Gear from "../components/icons/Gear";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <div className="flex">
      <div className="w-1/6 p-10 h-screen">
        <div id="pages">
          <Link href="/" className="flex items-center">
            <div className="mr-1">
              <RectangleGroup />
            </div>
            <div>Portfolio</div>
          </Link>
          <Link href="/settings" className="pt-3 flex items-center">
            <div className="mr-1">
              <Gear />
            </div>
            <div>Settings</div>
          </Link>
        </div>
      </div>
      <div className="w-5/6 h-screen" style={{ background: "#E7EBEF" }}>
        <Component {...pageProps} />
      </div>
    </div>
  );
}

export default MyApp;
