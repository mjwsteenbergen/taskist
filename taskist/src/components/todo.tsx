import Checkbox from 'design-system-components/src/checkbox';
import { NavArrowDown, NavArrowUp } from 'iconoir-react';
import { Badge } from './badge';
import { TodoText } from './todo-text';
import { cva } from 'class-variance-authority';

type TodoProps = {
  name: string;
  onWaitingFor?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onComplete?: () => void;
  big?: boolean;
  tags?: {
    text: string;
    color?: string;
    url?: string;
  }[];
};

const checkboxVariant = cva('', {
  variants: {
    big: {
      true: 'w-10 h-10 lg:w-20 lg:h-20 border-4',
      false: 'w-5 h-5 lg:w-10 lg:h-10',
    },
  },
  defaultVariants: {
    big: false,
  },
});

const componentWrapperVariant = cva('group flex items-center h-20', {
  variants: {
    big: {
      true: 'h-20 lg:h-40 gap-x-14',
      false: 'h-14 lg:h-20 gap-x-4',
    },
  },
  defaultVariants: {
    big: false,
  },
});

export const Todo = ({
  name,
  tags,
  big,
  onMoveDown,
  onMoveUp,
  onWaitingFor,
  onComplete,
}: TodoProps) => {
  return (
    <div className={componentWrapperVariant({ big })}>
      <Checkbox
        classname={checkboxVariant({ big })}
        onCheckedChange={onComplete}
      />
      <div className="">
        <TodoText big={big} text={name} />
        <div className="gap-x-2 overflow-hidden flex max-h-0 group-hover:max-h-12 transition-all duration-150">
          {onMoveDown && (
            <Badge onClick={onMoveDown}>
              <NavArrowDown />
            </Badge>
          )}
          {onMoveUp && (
            <Badge onClick={onMoveUp}>
              <NavArrowUp />
            </Badge>
          )}
          {onWaitingFor && <Badge onClick={onWaitingFor}>🕐</Badge>}
          {(tags ?? []).map((i) => (
            <Badge name={i.text} link={i.url} />
          ))}
        </div>
      </div>
    </div>
  );
};

{
  /* <div className={componentWrapperVariant({ big })}>
  <Checkbox classname={checkboxVariant({ big })} />
  <div className={contentWrapperVariant({ big })}>
    <TodoText big={big} text={name} />
    <div className="gap-x-2 hidden group-hover:flex">
      {onMoveDown && (
        <Badge onClick={onMoveDown}>
          <NavArrowDown />
        </Badge>
      )}
      {onMoveUp && (
        <Badge onClick={onMoveUp}>
          <NavArrowUp />
        </Badge>
      )}
      {onWaitingFor && <Badge onClick={onWaitingFor}>🕐</Badge>}
      {(tags ?? []).map((i) => (
        <Badge name={i.text} link={i.url} />
      ))}
    </div>
  </div>
</div>; */
}