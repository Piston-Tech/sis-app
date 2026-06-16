"use client";

import AdminLayout from "@/components/AdminLayout";
import Card from "@/components/Card";
import { Input, StudentSelector } from "@/components/Form";
import Modal from "@/components/Modal";
import useSingleTransaction from "@/hooks/useSingleTransaction";
import cn from "@/utils/cn";
import formatMoney from "@/utils/formatMoney";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { AnimatePresence } from "motion/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AddEnrollmentModal from "./AddEnrollmentModal";

const SingleTransactionPage = () => {
  const params = useParams<{ transactionId: string }>();

  const {
    transaction,
    addPaymentFormData,
    setAddPaymentFormData,
    paymentErrors,
    handleAddPayment,
    loadingPayment,
    showAddEnrollment,
    setShowAddEnrollment,
  } = useSingleTransaction(params.transactionId);

  if (!transaction) {
    return (
      <AdminLayout>
        <div className="max-w-5xl mx-auto space-y-8 pb-20 h-[90vh] flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/transactions"
              className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"
            >
              <button
                // onClick={() => navigate("/transactions")}
                className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
                Edit Transaction
              </h1>
              <p className="text-zinc-500 mt-1">
                Transaction #{transaction.transactionId} •{" "}
                {transaction.payerType === "B2B"
                  ? transaction.payer.name
                  : `${transaction.payer.firstName} ${transaction.payer.lastName}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                transaction.status === "Paid"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700",
              )}
            >
              {transaction.status}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Transaction Form */}
            <Card title="Transaction Details">
              <form
                // onSubmit={handleUpdateTransaction}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    disabled
                    label="Transaction Date"
                    value={new Date(transaction.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      },
                    )}
                  />

                  {/* <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
                      value={transaction.createdAt}
                      onChange={(e) =>
                        setTxForm({ ...txForm, date: e.target.value })
                      }
                    />
                  </div> */}

                  <div className="flex flex-col space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Status
                    </p>
                    <div className="flex-1 flex items-center">
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                          transaction.status === "Paid" &&
                            transaction.totalDue > 0
                            ? "bg-emerald-50 text-emerald-700"
                            : transaction.totalDue > 0
                              ? "bg-amber-50 text-amber-700"
                              : "bg-zinc-50 text-zinc-700",
                        )}
                      >
                        {transaction.totalDue > 0 ? transaction.status : "N/A"}
                      </span>
                    </div>
                  </div>
                  {/* <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Status
                    </label>
                    <select
                      className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
                      value={transaction.status}
                      onChange={(e) =>
                        setTxForm({ ...txForm, status: e.target.value })
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="Partial">Partial</option>
                      <option value="Paid">Paid</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div> */}
                  <Input
                    disabled
                    label="Total Due"
                    value={formatMoney(
                      transaction.subTotal,
                      true,
                      "Nigerian Naira",
                    )}
                  />
                  {/* <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Unit Price
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
                      value={transaction.totalDue}
                      onChange={(e) =>
                        setTxForm({
                          ...txForm,
                          unit_due: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div> */}
                  <Input
                    label="Discount"
                    value={formatMoney(
                      transaction.discount,
                      true,
                      "Nigerian Naira",
                    )}
                  />
                  {/* <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Discount
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
                      value={txForm.discount}
                      onChange={(e) =>
                        setTxForm({
                          ...txForm,
                          discount: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div> */}
                  <div>
                    <Input
                      disabled
                      label="Number of Enrollments"
                      value={transaction.noOfEnrollments}
                    />
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Managed via Linked Enrollments
                    </p>
                  </div>
                  {/* <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Number of Students
                    </label>
                    <input
                      type="number"
                      readOnly
                      className="w-full px-4 py-2 bg-zinc-100 border border-zinc-100 rounded-xl text-sm"
                      value={txForm.no_students}
                    />
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Managed via Linked Enrollments
                    </p>
                  </div> */}

                  <Input
                    disabled
                    label="Total Due"
                    value={formatMoney(
                      transaction.totalDue,
                      true,
                      "Nigerian Naira",
                    )}
                  />

                  {/* <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Total Due
                    </label>
                    <div className="w-full px-4 py-2 bg-zinc-100 border border-zinc-100 rounded-xl text-sm font-bold">
                      $
                      {(
                        txForm.unit_due * txForm.no_students -
                        txForm.discount
                      ).toLocaleString()}
                    </div>
                  </div> */}
                </div>
                <div className="flex justify-end">
                  {/* <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors"
                  >
                    <Save size={18} />
                    Save Changes
                  </button> */}
                </div>
              </form>
            </Card>

            {/* Enrollments Section */}
            <Card
              title="Linked Enrollments"
              action={
                <button
                  onClick={() => setShowAddEnrollment(true)}
                  className="flex items-center gap-2 text-xs font-bold text-black hover:underline"
                >
                  <Plus size={14} /> Add Enrollment
                </button>
              }
            >
              <div className="space-y-4">
                {transaction.enrollments.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-2xl group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white border border-zinc-100 flex items-center justify-center text-zinc-600 font-bold text-xs">
                        {e.student.firstName[0]}
                        {e.student.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">
                          {e.student.firstName} {e.student.lastName}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {e.class.course.code} •{" "}
                          {e.class.course.levelId || "Standard"} •{" "}
                          {e.class.schedule}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-white border border-zinc-100 text-zinc-500">
                        {e.status}
                      </span>
                      <button
                        // onClick={() => handleDeleteEnrollment(e.id)}
                        className="p-2 text-zinc-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {transaction.enrollments.length === 0 && (
                  <div className="text-center py-10 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                    <p className="text-sm text-zinc-400">
                      No enrollments linked to this transaction.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            {/* Summary Card */}
            <Card title="Financial Summary">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">Total Due</span>
                  <span className="text-sm font-bold text-zinc-900">
                    {formatMoney(transaction.totalDue, true, "Nigerian Naira")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">Total Paid</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {formatMoney(transaction.totalPaid, true, "Nigerian Naira")}
                  </span>
                </div>
                <div className="pt-4 border-t border-zinc-100 flex justify-between items-center">
                  <span className="text-sm font-bold text-zinc-900">
                    Balance
                  </span>
                  <span className="text-lg font-black text-rose-600">
                    {formatMoney(transaction.balance, true, "Nigerian Naira")}
                  </span>
                </div>
              </div>
            </Card>

            {/* Payments Section */}
            <Card title="Payment History">
              <div className="space-y-4">
                <div className="space-y-3">
                  {transaction.payments.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-zinc-900">
                          {formatMoney(p.amountPaid, true, "Nigerian Naira")}
                        </p>
                        <button
                          // onClick={() => handleDeletePayment(p.id)}
                          className="text-zinc-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-zinc-500">
                          {new Date(p.createdAt).toLocaleDateString()} •{" "}
                          {p.category}
                        </p>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider",
                            p.status === "RECEIVED"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700",
                          )}
                        >
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {transaction.payments.length === 0 && (
                    <p className="text-xs text-zinc-400 text-center py-4">
                      No payments recorded.
                    </p>
                  )}
                </div>

                <form
                  // onSubmit={handleAddPayment}
                  className="pt-4 border-t border-zinc-100 space-y-3"
                >
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Add New Payment
                  </p>
                  <Input
                    required
                    type="number"
                    placeholder="Amount"
                    data={addPaymentFormData}
                    setData={setAddPaymentFormData}
                    name={"amountPaid"}
                  />
                  {/* <div className="space-y-2">
                    <input
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-lg text-sm"
                      value={newPayment.amount_paid}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          amount_paid: e.target.value,
                        })
                      }
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        className="px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-lg text-xs"
                        value={newPayment.category}
                        onChange={(e) =>
                          setNewPayment({
                            ...newPayment,
                            category: e.target.value,
                          })
                        }
                      >
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Card">Card</option>
                      </select>
                      <input
                        type="date"
                        className="px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-lg text-xs"
                        value={newPayment.date}
                        onChange={(e) =>
                          setNewPayment({ ...newPayment, date: e.target.value })
                        }
                      />
                    </div>
                  </div> */}
                  <button
                    disabled={loadingPayment}
                    onClick={handleAddPayment}
                    type="submit"
                    className="w-full py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors"
                  >
                    Record Payment
                  </button>
                </form>
              </div>
            </Card>
          </div>
        </div>

        <AnimatePresence>
          {showAddEnrollment && (
            <AddEnrollmentModal
              transactionId={transaction.id}
              studentId={
                transaction.payerType === "B2C"
                  ? transaction.payerId
                  : undefined
              }
              close={() => setShowAddEnrollment(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default SingleTransactionPage;
