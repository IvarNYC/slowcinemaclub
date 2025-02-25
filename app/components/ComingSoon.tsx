import { Placeholder } from "./Placeholder";

export default function ComingSoon() {
  return (
    <div className="space-y-24">
      <section className="relative h-[90vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background">
          <Placeholder pattern="grid" className="opacity-50" />
        </div>
        <div className="relative z-10 flex h-full items-center justify-center">
          <div className="max-w-3xl text-center">
            <h1 className="mb-6 text-5xl font-medium tracking-tight">
              Coming Soon
            </h1>
            <p className="text-lg text-muted-foreground">
              We&apos;re crafting something special for you.
              Stay tuned for a new cinematic experience.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
