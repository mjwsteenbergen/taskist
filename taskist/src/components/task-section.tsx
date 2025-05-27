import { PropsWithChildren } from "react";

export const Header = ({
  children,
  classname,
}: PropsWithChildren<{ classname?: string }>) => {
  return <h2 className={"lg:text-6xl mb-6 " + classname}>{children}</h2>;
};

export const TaskSection = ({
  name,
  children,
}: PropsWithChildren<{
  name?: string;
}>) => {
  return (
    <section>
      {name && <Header>{name}</Header>}
      {children}
    </section>
  );
};
