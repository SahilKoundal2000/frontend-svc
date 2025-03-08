import Link from "next/link";
import Logo from "../ui/logo";
import { Button } from "../ui/button";

const Navbar: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-10">
      <nav className="container mx-auto flex justify-between items-center py-4 px-6">
        <Link href="#" className="text-xl font-bold text-teal-400">
          <Logo variant="rectangle" size={60} />
        </Link>
        <ul className="flex space-x-6 justify-center items-center">
          <li>
            <Link href="#how-we-work" className="hover:text-teal-400">
              How We Work
            </Link>
          </li>
          <li>
            <Link href="#login-signup">
              <Button>Login / Signup</Button>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
