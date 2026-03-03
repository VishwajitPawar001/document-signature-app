import { useState } from "react";
import { Rnd } from "react-rnd";
import SignatureModal from "./SignatureModal";

function SignatureBox({
  signature,
  mode = "layout",
  onUpdate,
  onSign
}) {
  const [showModal, setShowModal] = useState(false);

  const isSigned = signature.status === "Signed";
  const isRejected = signature.status === "Rejected";
  const isPending = signature.status === "Pending";

  const allowDrag = mode === "layout";
  const allowResize = mode === "layout";
  const allowSign = mode === "sign" && isPending;

  /* ================= SIGNED STATE ================= */
  if (isSigned) {
    return (
      <div
        style={{
          position: "absolute",
          top: signature.y,
          left: signature.x,
          width: signature.width,
          pointerEvents: "none"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%"
          }}
        >
          {/* Signature Image */}
          <img
            src={signature.image}
            alt="Signature"
            style={{
              maxHeight: 90,
              display: "block",
              margin: "0 auto"
            }}
          />

          {/* Info Block */}
          <div
            style={{
              marginTop: 8,
              textAlign: "center",
              width: "100%",
              fontSize: 12,
              lineHeight: "16px",
              color: "black"
            }}
          >
            <div style={{ fontWeight: 600 }}>
              {signature.participantName || signature.participantEmail}
            </div>

            <div style={{ color: "#555" }}>
              {signature.role}
            </div>

            {signature.designation && (
              <div style={{ fontStyle: "italic", color: "#777" }}>
                {signature.designation}
              </div>
            )}

            {signature.signedAt && (
              <div style={{ fontSize: 10, color: "#999", marginTop: 4 }}>
                {new Date(signature.signedAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ================= UNSIGNED ROLE STYLING ================= */
  const getRoleStyles = () => {
    if (isRejected) return "border-red-500 bg-red-500/10";

    switch (signature.role) {
      case "Signer":
        return "border-indigo-500 bg-indigo-500/10";
      case "Witness":
        return "border-yellow-500 bg-yellow-500/10";
      case "Validator":
        return "border-purple-500 bg-purple-500/10";
      default:
        return "border-gray-500 bg-gray-500/10";
    }
  };

  /* ================= STATUS BADGE ================= */
  const renderStatusBadge = () => {
    if (isRejected)
      return (
        <span className="absolute -top-2 -right-2 text-[9px] bg-red-600 px-2 py-[2px] rounded-full">
          Rejected
        </span>
      );

    if (isPending)
      return (
        <span className="absolute -top-2 -right-2 text-[9px] bg-yellow-600 px-2 py-[2px] rounded-full">
          Pending
        </span>
      );

    return null;
  };

  return (
    <>
      <Rnd
        size={{
          width: signature.width,
          height: signature.height
        }}
        position={{
          x: signature.x,
          y: signature.y
        }}
        bounds="parent"
        disableDragging={!allowDrag}
        enableResizing={allowResize}
        minWidth={120}
        minHeight={50}
        className={`absolute border-2 rounded-md shadow-md backdrop-blur-sm transition-all duration-200 ${getRoleStyles()} ${allowSign ? "cursor-pointer hover:shadow-lg" : ""
          }`}
        onDragStop={(e, d) => {
          if (allowDrag && onUpdate) {
            onUpdate({
              ...signature,
              x: d.x,
              y: d.y
            });
          }
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          if (allowResize && onUpdate) {
            onUpdate({
              ...signature,
              width: ref.offsetWidth,
              height: ref.offsetHeight,
              ...position
            });
          }
        }}
        onClick={() => {
          if (allowSign) {
            setShowModal(true);
          }
        }}
      >
        {renderStatusBadge()}

        <div className="w-full h-full flex flex-col items-center justify-center text-[11px] text-white text-center px-2">
          <div className="font-semibold truncate">
            {signature.participantEmail}
          </div>

          <div className="opacity-80">
            {signature.role}
          </div>

          {allowSign && (
            <div className="mt-1 text-indigo-300 animate-pulse">
              Click to Sign
            </div>
          )}
        </div>
      </Rnd>

      {showModal && allowSign && (
        <SignatureModal
          onClose={() => setShowModal(false)}
          onSave={(imageData) => {
            if (onSign) onSign(imageData);
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}

export default SignatureBox;