import { useEffect } from "react";
import useCycleStore from "../store/cycleStore";
import {
  createCycle,
  getActiveCycle,
  verifyEndCycle,
  endCycle,
} from "../services/cycleService";

const CyclePage = () => {
  const { activeCycle, setActiveCycle } = useCycleStore();

  useEffect(() => {
    fetchActiveCycle();
  }, []);

  const fetchActiveCycle = async () => {
    const response = await getActiveCycle();

    if (response.success) {
      setActiveCycle(response.data);
    }
  };

  const handleCreateCycle = async () => {
    const response = await createCycle({
      cycleName: "July 2026",
      startDate: "2026-07-15",
    });

    if (response.success) {
      fetchActiveCycle();
    }
  };

  const handleEndCycle = async () => {
    const verify = await verifyEndCycle({
      cycleId: activeCycle.id,
    });

    if (!verify.success) return;

    const response = await endCycle({
      cycleId: activeCycle.id,
      endDate: "2026-08-14",
    });

    if (response.success) {
      fetchActiveCycle();
    }
  };

  return (
    <div className="p-5">
      <button onClick={handleCreateCycle}>Create Cycle</button>

      <br />
      <br />

      <button onClick={handleEndCycle}>End Cycle</button>

      <br />
      <br />

      <pre>{JSON.stringify(activeCycle, null, 2)}</pre>
    </div>
  );
};

export default CyclePage;