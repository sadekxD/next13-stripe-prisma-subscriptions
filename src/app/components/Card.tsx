import { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
}

export default function Card({ title, description, footer, children }: Props) {
  return (
    <div className="border border-zinc-700	max-w-3xl w-full p rounded-md m-auto my-8">
      <div className="px-5 py-4">
        <h3 className="text-2xl mb-1 font-medium">{title}</h3>
        <p>{description}</p>
        {children}
      </div>
      <div className="border-t border-zinc-700 p-4 text-zinc-500 rounded-b-md">
        {footer}
      </div>
    </div>
  );
}
