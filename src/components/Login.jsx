// src/components/Login.jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { ArrowRight, LayoutDashboard, ShieldCheck, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import loginImg from "../assets/Login.jpg";
import usePost from "@/hooks/usePost";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { postData, loading } = usePost("/api/admin/auth/login");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values) {
    try {
      const res = await postData(values);
      if (res?.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f1f5f9] p-4 md:p-8">
      {/* Container الرئيسي بالهوية البصرية الجديدة */}
      <div className="flex w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)]">

        {/* الجزء الأيسر: SYSTEGO Brand Zone */}
        <div className="relative hidden w-[45%] md:block">
          <img
            src={loginImg}
            alt="Professional System"
            className="h-full w-full object-cover shadow-inner"
          />
          {/* Overlay بالأحمر والرمادي المستوحى من اللوجو */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#e11d48]/90 via-[#475569]/70 to-transparent p-12 text-white flex flex-col justify-between">
            <div className="flex items-center gap-2 bg-white/10 w-fit px-4 py-2 rounded-lg backdrop-blur-md border border-white/20">
              <Settings size={18} className="text-white animate-spin-slow" />
              <span className="text-sm font-bold tracking-[0.2em] uppercase">Professional Go</span>
            </div>

            <div>
              <h1 className="text-5xl font-black leading-none mb-4 tracking-tight">
                SYSTEGO <br />
                <span className="text-gray-200 font-light italic text-3xl">Control Center</span>
              </h1>
              <div className="h-1.5 w-20 bg-[#e11d48] mb-6 rounded-full"></div>
              <p className="text-lg text-white/90 max-w-sm font-medium">
                Streamlining your business operations with advanced professional solutions.
              </p>
            </div>
          </div>
        </div>

        {/* الجزء الأيمن: Login Form */}
        <div className="flex w-full flex-col justify-center px-8 py-16 md:w-[55%] lg:px-24">
          <div className="mb-12">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <ShieldCheck size={24} className="text-[#e11d48]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">System Login</h2>
                <p className="text-slate-500 text-sm font-medium">Enter your credentials to access the portal</p>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Admin Identity</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="identity@systego.com"
                        {...field}
                        className="h-14 rounded-xl border-slate-200 bg-slate-50 px-5 focus:border-[#e11d48] focus:ring-red-100 transition-all font-medium"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Access Key</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className="h-14 rounded-xl border-slate-200 bg-slate-50 px-5 focus:border-[#e11d48] focus:ring-red-100 transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={loading}
                className="group h-14 w-full rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-white text-lg font-bold shadow-xl shadow-red-100 transition-all hover:shadow-red-200 active:scale-[0.97]"
              >
                {loading ? (
                  <span className="flex items-center gap-3"><span className="animate-pulse">Authenticating</span>...</span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    LOGIN TO SYSTEM <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </form>
          </Form>

        </div>
      </div>
    </div>
  );
}