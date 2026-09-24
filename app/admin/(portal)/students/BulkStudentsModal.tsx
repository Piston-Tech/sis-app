"use client";

import { CompanySelector } from "@/components/Form";
import BulkImportModal from "@/components/admin/BulkImportModal";
import { useToast } from "@/components/admin/Toast";
import { useMemo, useState } from "react";

/**
 * Students from a spreadsheet:
 * POST /admin/students/bulk { rows, companyId?, dryRun? }.
 * Existing emails are skipped; valid rows are created even if others fail.
 */
const BulkStudentsModal = ({ onClose }: { onClose: () => void }) => {
  const toast = useToast();
  const [companyId, setCompanyId] = useState<number | undefined>();
  const extraBody = useMemo(
    () => (companyId ? { companyId } : {}),
    [companyId],
  );

  return (
    <BulkImportModal
      kind="students"
      title="Bulk upload students"
      description={
        <p>
          Students whose email already exists are skipped. A{" "}
          <code className="font-mono">company</code> column (ORG code, id or
          exact name) overrides the default company for that row.
        </p>
      }
      endpoint="/admin/students/bulk"
      extraBody={extraBody}
      invalidate={["students", "companies"]}
      onImported={(result) =>
        toast.success(
          `Import finished: ${result.summary?.created ?? 0} created, ${result.summary?.skipped ?? 0} skipped, ${result.summary?.failed ?? 0} failed.`,
        )
      }
      onClose={onClose}
      settings={
        <div className="space-y-2">
          <CompanySelector
            label="Default company (Optional)"
            value={companyId}
            onChange={setCompanyId}
          />
          {companyId ? (
            <button
              type="button"
              onClick={() => setCompanyId(undefined)}
              className="text-xs font-semibold text-zinc-500 hover:text-black underline"
            >
              Clear default company
            </button>
          ) : (
            <p className="text-[11px] text-zinc-500">
              Applied to rows without a company. Leave empty for individuals.
            </p>
          )}
        </div>
      }
    />
  );
};

export default BulkStudentsModal;
