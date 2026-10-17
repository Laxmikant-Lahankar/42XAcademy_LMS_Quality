import { useCallback, useState } from "react";

import { useAsync } from "../../hooks/useAsync";
import { useToast } from "../../hooks/useToast";

// Shared list + create/edit/delete behaviour for admin pages.
//   const crud = useAdminCrud({ load: adminService.getCourses, save: adminService.saveCourse,
//                               remove: (course) => adminService.deleteCourse(course.id), label: "Course" });
// `load` must be stable (a service function, or wrapped in useCallback). `remove` receives the whole row.
// Optional: messages { created, updated, deleted } and onChange() (called after any save/delete).
export function useAdminCrud({ load, save, remove, label, messages, onChange }) {
  const showToast = useToast();
  const { data, error, reload } = useAsync(load);
  const [editing, setEditing] = useState(null);

  // Errors are re-thrown so FormModal can show them inside the form.
  const saveItem = useCallback(
    async (values) => {
      await save(values);
      showToast(
        values.id
          ? messages?.updated ?? `${label} updated.`
          : messages?.created ?? `${label} created.`
      );
      setEditing(null);
      reload();
      onChange?.();
    },
    [save, label, messages, showToast, reload, onChange]
  );

  const removeItem = useCallback(
    async (item) => {
      try {
        await remove(item);
        showToast(messages?.deleted ?? `${label} deleted.`);
        reload();
        onChange?.();
      } catch (removeError) {
        showToast(removeError.message || `Could not delete the ${label.toLowerCase()}.`, "error");
      }
    },
    [remove, label, messages, showToast, reload, onChange]
  );

  return { data, error, reload, editing, setEditing, saveItem, removeItem };
}
