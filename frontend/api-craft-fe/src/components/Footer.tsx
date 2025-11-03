import talk51Logo from "@/assets/51TalkLogo.png.webp";

const Footer = () => {
  return (
    <footer className="w-full py-6 border-t border-border mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4">
          <img src={talk51Logo} alt="51Talk" className="h-12" />
          <p className="text-center text-sm text-muted-foreground">
            Developed and created by the AIBP team in Cairo region
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
