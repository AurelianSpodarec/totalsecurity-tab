import { Html } from "@packages/utility";
import { GlobeIcon } from "@radix-ui/react-icons";

type FaviconProps = {
  url?: string;
  alt?: string;
  className?: string;
};

export function Favicon({ url, alt = "favicon", className }: FaviconProps) {
  if (url) {
    return (
      <img
        alt={alt}
        className={Html.joinClasses("h-[24px] w-[24px]", className)}
        src={url}
      />
    );
  }

  return <GlobeIcon style={{ height: 24, width: 24 }} />;
}
