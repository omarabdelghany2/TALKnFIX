import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authAPI, setToken } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import logo from "@/assets/talknfix-logo.png";
import Footer from "@/components/Footer";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerFullName, setRegisterFullName] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.login({
        email: loginEmail,
        password: loginPassword,
      });

      setToken(response.token);
      toast({
        title: t("auth.welcomeBack"),
        description: t("auth.loginSuccess"),
      });
      navigate("/feed");
    } catch (error: any) {
      toast({
        title: t("auth.loginFailed"),
        description: error.message || t("auth.invalidCredentials"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.register({
        username: registerUsername,
        email: registerEmail,
        password: registerPassword,
        fullName: registerFullName,
      });

      setToken(response.token);
      toast({
        title: t("auth.registerSuccess"),
        description: t("auth.accountCreated"),
      });
      navigate("/feed");
    } catch (error: any) {
      toast({
        title: t("auth.registerFailed"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="flex justify-center mb-8">
            <img src={logo} alt="TalkNFix" className="h-20 md:h-24" />
          </div>
          <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
            <TabsTrigger value="register">{t("auth.register")}</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("auth.email")}</label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("auth.password")}</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t("common.loading") : t("auth.login")}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("auth.fullName")}</label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={registerFullName}
                  onChange={(e) => setRegisterFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("auth.username")}</label>
                <Input
                  type="text"
                  placeholder="johndoe"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("auth.email")}</label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("auth.password")}</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t("common.loading") : t("auth.register")}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
