import { PropsWithChildren, useRef, useState } from 'react';
import { Circle, NavArrowDown } from 'iconoir-react';

export const Main = () => {
    const [isScrying, setIsScrying] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const enableScrying = () => {
        setIsScrying(true);
        ref.current?.scrollIntoView({
            behavior: "smooth"
        });
    }

    return (
        <>
            <div className="flex flex-col min-h-screen justify-items-stretch justify-center py-8">
                <div className="grid justify-center content-center grow">
                    <Header>To Do</Header>
                    <Todo />
                </div>
                {!isScrying && <button className="tertiary place-self-end justify-self-start" onClick={enableScrying}>
                    <NavArrowDown />
                </button>}
            </div>
            <div className="bg-gray-50 min-h-screen" ref={ref}>
                <Header>Overdue</Header>
            </div>
        </>
    );
};

export const Header = ({ children }: PropsWithChildren<{}>) => {
    return <h2 className='lg:text-6xl mb-6'>{children}</h2>
}

export const Todo = () => {
    return <div className="flex gap-4 items-center">
        <Circle className='lg:w-14 lg:h-14' />
        <span className="leading-none lg:text-5xl">Get some work done</span>
    </div>
}
