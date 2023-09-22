import Pricing from "@/app/components/Pricing";

export default function Home() {
  return (
    <main className=" flex min-h-screen flex-col items-center justify-between p-24">
      <div className="grid grid-cols-3 gap-5">
        <Pricing  />
        {/* <Pricing />
        <Pricing /> */}
      </div>
    </main>
  );
}
