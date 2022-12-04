/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";

export default function Modal({
  show,
  beneficiaryId,
  transferAmount,
  expiryDate,
  currentToken,
  allowanceAmount,
  approvalCheck,
  setShow,
  setBeneficiaryId,
  setTransferAmount,
  handleAddBeneficiary,
  handleApprove,
  setExpiryDate,
  setCurrentToken,
  setAllowanceAmount,
}) {
  const cancelButtonRef = useRef(null);

  return (
    <Transition.Root show={show} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        initialFocus={cancelButtonRef}
        onClose={() => {
          setCurrentToken({});
          setAllowanceAmount("");
        }}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-70"
          leave="ease-in duration-200"
          leaveFrom="opacity-70"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 modal-background bg-gray-300 transition-opacity" />
        </Transition.Child>

        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end items-center justify-center min-h-full p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-3xl sm:w-full">
                <div
                  className="secondary-text text-white text-opacity-50 sm:py-16 sm:px-20 px-10 py-8"
                  style={{ background: "#E7EBEF" }}
                >
                  <div id="course-wrapper" className="w-full mt-5">
                    <form>
                      {approvalCheck ? (
                        <>
                          <div className="mb-6">
                            <label
                              className="block text-gray-600 text-sm font-bold mb-2"
                              htmlFor="beneficiary-id"
                            >
                              Who is supposed to receive this?
                            </label>
                            <input
                              className="appearance-none border rounded w-full py-3 px-3 text-gray-600 leading-tight focus:outline-none"
                              id="beneficiary-id"
                              value={beneficiaryId}
                              type="text"
                              placeholder="Beneficiary ID"
                              onChange={(e) => setBeneficiaryId(e.target.value)}
                            />
                          </div>
                          <div className="mb-6">
                            <label
                              className="block text-gray-600 text-sm font-bold mb-2"
                              htmlFor="expiry-date"
                            >
                              When should the beneficiary receive his share?
                            </label>
                            <input
                              className="appearance-none border rounded w-full py-3 px-3 text-gray-600 leading-tight focus:outline-none"
                              id="expiry-date"
                              value={expiryDate}
                              type="text"
                              placeholder="YYYY-MM-DD"
                              onChange={(e) => setExpiryDate(e.target.value)}
                            />
                          </div>
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none"
                            type="button"
                            onClick={() => handleAddBeneficiary()}
                          >
                            Add Beneficiary
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="mb-4">
                            <label
                              className="block text-gray-600 text-sm font-bold mb-2"
                              htmlFor="token-address"
                            >
                              Token Address
                            </label>
                            <input
                              className="appearance-none border rounded w-full py-1 text-gray-600 leading-tight focus:outline-none"
                              id="token-address"
                              value={currentToken.contract_address}
                              type="text"
                              disabled={true}
                              placeholder="Token Address"
                            />
                          </div>
                          <div className="mb-6">
                            <label
                              className="block text-gray-600 text-sm font-bold mb-2"
                              htmlFor="transfer-amount"
                            >
                              How much units you wish to allocate?
                            </label>
                            <input
                              className="appearance-none border rounded w-full py-3 px-3 text-gray-600 leading-tight focus:outline-none"
                              id="transfer-amount"
                              value={allowanceAmount}
                              type="text"
                              placeholder="Allowance Amount"
                              onChange={(e) =>
                                setAllowanceAmount(e.target.value)
                              }
                            />
                          </div>
                          <div className="flex items-center">
                            <button
                              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none"
                              type="button"
                              onClick={() => handleApprove()}
                            >
                              Approve
                            </button>
                          </div>
                        </>
                      )}
                    </form>
                  </div>
                </div>
                <div
                  className="absolute top-5 text-gray-600 right-5 cursor-pointer"
                  onClick={() => {
                    setCurrentToken({});
                    setShow(!show);
                  }}
                >
                  <XIcon className="h-7 w-7" aria-hidden="true" />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
