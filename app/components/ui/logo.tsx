import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: number;
  variant: "square" | "rectangle" | "nolabel" | "background";
}

const Logo: React.FC<LogoProps> = ({ className, size = 150, variant }) => {
  let logoSrc = "/images/logo.svg";
  let aspectRatio = 1;

  switch (variant) {
    case "square":
      logoSrc = "/images/logo-square.svg";
      aspectRatio = 1;
      break;
    case "rectangle":
      logoSrc = "/images/logo-rect.svg";
      aspectRatio = 4;
      break;
    case "nolabel":
      logoSrc = "/images/logo.svg";
      aspectRatio = 1;
      break;
    case "background":
      logoSrc = "/images/logo-bg.svg";
      aspectRatio = 1;
      break;
  }

  return (
    <Image
      className={className}
      src={logoSrc}
      alt="PharmaKart Logo"
      width={size * aspectRatio}
      height={size}
    />
  );
};

export default Logo;
