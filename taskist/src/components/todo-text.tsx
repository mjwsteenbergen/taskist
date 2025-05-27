import { cva } from 'class-variance-authority';

const variant = cva('mb-0 truncate max-w-[calc(100vw - 6rem)]', {
  variants: {
    isCompleted: {
      true: "line-through"
    },
    big: {
      true: 'text-4xl lg:text-9xl font-title !leading-[1.2]',
      false: 'lg:text-5xl',
    },
  },
  defaultVariants: {
    big: false,
  },
});

export const TodoText = ({ text, big, isCompleted }: { text: string; big?: boolean, isCompleted: boolean }) => {
  const mdLink = new RegExp(/\[(.+)\]\((.+)\)/g).exec(text);
  const tdLink = new RegExp(/(https?:\/\/[^ ]+) \((.+)\)/g).exec(text);
  if (mdLink ?? tdLink) {
    const { link, linktext } = mdLink
      ? {
          link: mdLink[2],
          linktext: mdLink[1],
        }
      : {
          link: tdLink?.[1],
          linktext: tdLink?.[2],
        };

    return (
      <a
        target="_blank"
        className={variant({
          isCompleted,
          big,
          className: 'reset text-gray-300 dark:text-gray-100',
        })}
        href={link}
      >
        {linktext}
      </a>
    );
  }
  return <p className={variant({ big })}>{text}</p>;
};
