import Navbar from "@/components/Navbar";
import { useTranslation } from "react-i18next";

const Friends = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t("nav.friends")}</h1>
        <p className="text-muted-foreground">
          Friends page - Coming soon!
        </p>
      </div>
    </div>
  );
};

export default Friends;
