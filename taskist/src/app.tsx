import { useRef, useState } from 'react';
import { useTodoPageSections } from './hooks/useTodoPageSections';
import { TaskSection } from './components/task-section';

export const App = () => {
  const [isScrying, setIsScrying] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const {
    inProgress,
    ready,
    waiting_for,
    overdue,
    next_up,
    moveToReadyToPickUp,
    moveToInProgress,
    backToDefaultSection,
    addWaitingFor,
    removeWaitingFor,
    complete,
  } = useTodoPageSections();

  const enableScrying = () => {
    setIsScrying(true);
  };

  //   useEffect(() => {
  //     ref.current?.scrollIntoView({
  //       behavior: 'smooth',
  //     });
  //   }, [isScrying]);

  return (
    <>
      <div className="flex flex-col min-h-screen justify-items-center items-center justify-center ml-5 py-8">
        <div className="grid max-w-[-webkit-fill-available] overflow-hidden grow content-around">
          <TaskSection
            big
            tasks={inProgress()}
            onWaitingFor={addWaitingFor}
            onMoveDown={moveToReadyToPickUp}
            onComplete={complete}
          />
          <TaskSection
            name="Ready to pickup"
            tasks={ready()}
            onWaitingFor={addWaitingFor}
            onMoveDown={backToDefaultSection}
            onMoveUp={moveToInProgress}
            onComplete={complete}
          />
          <TaskSection
            name="Waiting For"
            tasks={waiting_for()}
            onWaitingFor={removeWaitingFor}
            onComplete={complete}
          />
        </div>
        {/* {!isScrying && (
          <button
            className="place-self-end justify-self-start lg:fixed bottom-6 right-6"
            onClick={enableScrying}
          >
            <NavArrowDown />
          </button>
        )} */}
      </div>
      {/* {isScrying && ( */}
      <div
        className="bg-gray-50 min-h-screen grid justify-center content-center py-8"
        ref={ref}
      >
        <div className="grid content-center max-w-max grow">
          <TaskSection
            name="Overdue"
            tasks={overdue()}
            onMoveUp={moveToReadyToPickUp}
            onComplete={complete}
          />
          <TaskSection
            name="Next up"
            tasks={next_up()}
            onMoveUp={moveToReadyToPickUp}
            onComplete={complete}
          />
        </div>
      </div>
      {/* )} */}
    </>
  );
};

//
