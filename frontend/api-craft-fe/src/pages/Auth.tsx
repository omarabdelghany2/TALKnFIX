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
import logo51talk from "@/assets/logo.png";

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
        title: t('auth.welcomeBack'),
        description: t('auth.loginSuccess'),
      });
      navigate("/feed");
    } catch (error: any) {
      toast({
        title: t('auth.loginFailed'),
        description: error.message || t('auth.invalidCredentials'),
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
        title: t('auth.accountCreated'),
        description: t('auth.welcomeMessage'),
      });
      navigate("/feed");
    } catch (error: any) {
      toast({
        title: t('auth.registrationFailed'),
        description: error.message || t('auth.couldNotCreateAccount'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-light via-background to-yellow-light flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt={t('common.appName')} className="h-16 mb-4" />
          <h1 className="text-3xl font-bold text-center">{t('common.appName')}</h1>
          <p className="text-muted-foreground text-center mt-2">
            {t('common.tagline')}
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
            <TabsTrigger value="register">{t('auth.register')}</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('auth.email')}</label>
                <Input
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('auth.password')}</label>
                <Input
                  type="password"
                  placeholder={t('auth.passwordPlaceholder')}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? t('auth.loggingIn') : t('auth.login')}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('auth.username')}</label>
                <Input
                  type="text"
                  placeholder={t('auth.usernamePlaceholder')}
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={30}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('auth.fullName')}</label>
                <Input
                  type="text"
                  placeholder={t('auth.fullNamePlaceholder')}
                  value={registerFullName}
                  onChange={(e) => setRegisterFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('auth.email')}</label>
                <Input
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('auth.password')}</label>
                <Input
                  type="password"
                  placeholder={t('auth.passwordPlaceholder')}
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? t('auth.creatingAccount') : t('auth.register')}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
      </div>

      {/* 51Talk Footer */}
      <footer className="w-full py-6 bg-card/50 backdrop-blur-sm border-t border-border">
        <div className="container mx-auto flex flex-col items-center space-y-2">
          <img src={logo51talk} alt="51Talk" className="h-10 opacity-80" />
          <p className="text-xs text-muted-foreground text-center font-bold">
            {t('auth.footer')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Auth;
