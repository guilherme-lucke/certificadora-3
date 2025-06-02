import React from "react";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = "Confirmar",
  confirmingText = "Processando...", // Novo prop com valor padrão
  cancelText = "Cancelar",
  isConfirming = false,
  confirmButtonVariant = "danger", // Novo prop: 'danger', 'success', 'warning', 'primary'
}) => {
  if (!isOpen) return null;

  const getConfirmButtonClasses = () => {
    let baseClasses =
      "px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50";
    switch (confirmButtonVariant) {
      case "success":
        return `${baseClasses} bg-green-600 hover:bg-green-700 focus:ring-green-500`;
      case "warning":
        return `${baseClasses} bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500 text-black`; // Texto preto para melhor contraste com amarelo
      case "primary":
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`;
      default: // danger
        return `${baseClasses} bg-red-600 hover:bg-red-700 focus:ring-red-500`;
    }
  };
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        {" "}
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="text-gray-700 mb-6">{children}</div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isConfirming}
            className={getConfirmButtonClasses()}
          >
            {isConfirming ? confirmingText : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
