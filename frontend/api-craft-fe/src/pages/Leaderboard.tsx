import Navbar from "@/components/Navbar";
import { useTranslation } from "react-i18next";

const Leaderboard = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t("leaderboard.title")}</h1>
        <p className="text-muted-foreground">
          Leaderboard page - Coming soon!
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;
