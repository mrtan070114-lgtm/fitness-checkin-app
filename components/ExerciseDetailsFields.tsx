"use client";

import { Check, Dumbbell, ListChecks, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { TRAINING_TYPES } from "@/lib/constants";
import {
  EXERCISE_PRESETS,
  deriveTrainingTypes,
  getExerciseKind,
  getExerciseTrainingType,
  normalizeExerciseDetails
} from "@/lib/exerciseDetails";
import type { ExerciseDetail, TrainingType } from "@/types/database";

type ExerciseDetailsFieldsProps = {
  initialDetails?: ExerciseDetail[] | null;
  initialNames?: string[] | null;
  initialTrainingTypes?: TrainingType[] | null;
  layout?: "embedded" | "quick";
};

const EXERCISE_SELECTION_EVENT = "exercise-selection-count";
const COMMON_EXERCISES = ["俯卧撑", "深蹲", "卷腹", "平板支撑", "跑步", "跳绳"];

function getInitialNames(initialDetails?: ExerciseDetail[] | null, initialNames?: string[] | null) {
  const detailNames = normalizeExerciseDetails(initialDetails, initialNames).map((detail) => detail.name);
  return Array.from(new Set(detailNames));
}

function getCustomInitialNames(names: string[]) {
  const presetNames = new Set(EXERCISE_PRESETS.map((exercise) => exercise.name));
  return names.filter((name) => !presetNames.has(name));
}

function getCustomInitialTrainingTypes(names: string[], initialTrainingTypes?: TrainingType[] | null) {
  const fallback = initialTrainingTypes?.[0] || "腹";

  return Object.fromEntries(
    getCustomInitialNames(names).map((name) => [name, getExerciseTrainingType(name, fallback) || fallback])
  ) as Record<string, TrainingType>;
}

function inputValue(value: number | null | undefined) {
  return value ?? "";
}

export function ExerciseDetailsFields({
  initialDetails = null,
  initialNames = null,
  initialTrainingTypes = null,
  layout = "embedded"
}: ExerciseDetailsFieldsProps) {
  const initialDetailMap = useMemo(() => {
    return new Map(normalizeExerciseDetails(initialDetails, initialNames).map((detail) => [detail.name, detail]));
  }, [initialDetails, initialNames]);
  const initialSelectedNames = useMemo(() => getInitialNames(initialDetails, initialNames), [initialDetails, initialNames]);
  const [selectedNames, setSelectedNames] = useState(() => initialSelectedNames);
  const [customNames, setCustomNames] = useState(() => getCustomInitialNames(initialSelectedNames));
  const [customTrainingTypes, setCustomTrainingTypes] = useState(() => getCustomInitialTrainingTypes(initialSelectedNames, initialTrainingTypes));
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customTrainingType, setCustomTrainingType] = useState<TrainingType>("腹");
  const [customError, setCustomError] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<TrainingType | "all" | null>(null);
  const presetNames = EXERCISE_PRESETS.map((exercise) => exercise.name);
  const actionOptions = [...presetNames, ...customNames];
  const selectedTrainingTypes = deriveTrainingTypes(
    selectedNames,
    selectedNames.map((name) => customTrainingTypes[name] || getExerciseTrainingType(name, initialTrainingTypes?.[0]) || "腹")
  );
  const visiblePresetNames = activeType
    ? EXERCISE_PRESETS
      .filter((exercise) => activeType === "all" || exercise.trainingType === activeType)
      .map((exercise) => exercise.name)
    : [];

  useEffect(() => {
    window.dispatchEvent(new CustomEvent(EXERCISE_SELECTION_EVENT, { detail: { count: selectedNames.length } }));
  }, [selectedNames.length]);

  function getTrainingTypeForName(name: string) {
    return customTrainingTypes[name] || getExerciseTrainingType(name, initialTrainingTypes?.[0]) || "腹";
  }

  function toggleExercise(name: string) {
    setSelectedNames((current) => (
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name]
    ));
  }

  function addCustomExercise() {
    const name = customName.trim();
    if (!name) {
      setCustomError("请输入动作名称");
      return;
    }

    if (actionOptions.includes(name)) {
      setCustomError("该动作已存在");
      return;
    }

    setCustomNames((current) => [...current, name]);
    setCustomTrainingTypes((current) => ({ ...current, [name]: customTrainingType }));
    setSelectedNames((current) => (current.includes(name) ? current : [...current, name]));
    setCustomName("");
    setCustomTrainingType("腹");
    setCustomError(null);
    setCustomOpen(false);
  }

  function cancelCustomExercise() {
    setCustomOpen(false);
    setCustomName("");
    setCustomTrainingType("腹");
    setCustomError(null);
  }

  function renderExerciseChip(name: string) {
    const selected = selectedNames.includes(name);

    return (
      <button
        className={selected ? "exercise-action-chip selected" : "exercise-action-chip"}
        key={name}
        type="button"
        onClick={() => toggleExercise(name)}
      >
        {name}
      </button>
    );
  }

  function renderCustomPanel() {
    if (!customOpen) return null;

    return (
      <div className="exercise-custom-panel">
        <label>
          自定义动作名称
          <input
            autoFocus
            maxLength={24}
            value={customName}
            onChange={(event) => {
              setCustomName(event.target.value);
              setCustomError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addCustomExercise();
              }
            }}
            placeholder="例如 波比跳"
          />
        </label>
        <label>
          归属部位
          <select value={customTrainingType} onChange={(event) => setCustomTrainingType(event.target.value as TrainingType)}>
            {TRAINING_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        {customError ? <p className="exercise-custom-error">{customError}</p> : null}
        <div className="exercise-custom-actions">
          <button className="secondary-button compact" type="button" onClick={addCustomExercise}>
            <Check size={15} aria-hidden="true" />
            确认添加
          </button>
          <button className="ghost-button compact" type="button" onClick={cancelCustomExercise}>
            取消
          </button>
        </div>
      </div>
    );
  }

  function renderRecognition() {
    return (
      <div className="exercise-recognition-panel">
        <span>已识别：</span>
        {selectedTrainingTypes.length ? (
          <div className="exercise-type-tags">
            {selectedTrainingTypes.map((type) => (
              <span className="exercise-type-tag" key={type}>{type}</span>
            ))}
          </div>
        ) : (
          <p>选择动作后自动识别训练部位</p>
        )}
      </div>
    );
  }

  function renderPicker() {
    return (
      <div className="exercise-details-panel">
        <div className="exercise-picker-block">
          <div className="exercise-picker-label">常用动作：</div>
          <div className="exercise-picker-grid" aria-label="常用动作">
            {COMMON_EXERCISES.map(renderExerciseChip)}
          </div>
        </div>

        <div className="exercise-filter-tabs" aria-label="动作分类筛选">
          {TRAINING_TYPES.map((type) => (
            <button
              className={activeType === type ? "exercise-filter-tab selected" : "exercise-filter-tab"}
              key={type}
              type="button"
              onClick={() => setActiveType(type)}
            >
              {type}
            </button>
          ))}
          <button
            className={activeType === "all" ? "exercise-filter-tab selected" : "exercise-filter-tab"}
            type="button"
            onClick={() => setActiveType("all")}
          >
            全部动作
          </button>
        </div>

        {activeType ? (
          <div className="exercise-picker-block">
            <div className="exercise-picker-label">{activeType === "all" ? "全部动作" : `${activeType}部位动作`}</div>
            <div className="exercise-picker-grid" aria-label={activeType === "all" ? "全部动作" : `${activeType}动作`}>
              {visiblePresetNames.map(renderExerciseChip)}
            </div>
          </div>
        ) : (
          <button className="ghost-button compact exercise-show-all-button" type="button" onClick={() => setActiveType("all")}>
            显示全部动作
          </button>
        )}

        {customNames.length ? (
          <div className="exercise-picker-block">
            <div className="exercise-picker-label">自定义动作</div>
            <div className="exercise-picker-grid" aria-label="自定义动作">
              {customNames.map(renderExerciseChip)}
            </div>
          </div>
        ) : null}

        {!customOpen ? (
          <div className="exercise-picker-grid custom-trigger-grid">
            <button className="exercise-action-chip exercise-custom-trigger" type="button" onClick={() => setCustomOpen(true)}>
              <Plus size={15} aria-hidden="true" />
              自定义
            </button>
          </div>
        ) : null}

        {renderCustomPanel()}
        {renderRecognition()}
      </div>
    );
  }

  function renderDetails() {
    return selectedNames.length ? (
      <div className="exercise-detail-list">
        {selectedNames.map((name, index) => (
          <ExerciseDetailCard
            detail={initialDetailMap.get(name)}
            index={index}
            key={name}
            name={name}
            onRemove={() => setSelectedNames((current) => current.filter((item) => item !== name))}
            trainingType={getTrainingTypeForName(name)}
          />
        ))}
      </div>
    ) : (
      <p className="form-note">选择训练动作后，这里会生成每个动作的训练计数。</p>
    );
  }

  if (layout === "quick") {
    return (
      <>
        <section className="form-card form-section checkin-step-card checkin-focus-card">
          <div className="section-heading section-heading-with-icon">
            <span className="form-section-icon"><Dumbbell size={18} aria-hidden="true" /></span>
            <div>
              <p className="eyebrow">训练内容</p>
              <h2>选择这次练了什么</h2>
            </div>
          </div>
          {renderPicker()}
        </section>

        <section className="form-card form-section checkin-step-card">
          <div className="section-heading section-heading-with-icon">
            <span className="form-section-icon"><ListChecks size={18} aria-hidden="true" /></span>
            <div>
              <p className="eyebrow">动作计数</p>
              <h2>填写完成量</h2>
            </div>
          </div>
          {renderDetails()}
        </section>
      </>
    );
  }

  return (
    <div className="exercise-details-panel">
      {renderPicker()}
      {renderDetails()}
    </div>
  );
}

export function ExerciseSelectionCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function syncCount(event?: Event) {
      if (event instanceof CustomEvent && typeof event.detail?.count === "number") {
        setCount(event.detail.count);
        return;
      }

      setCount(document.querySelectorAll('input[name="exercise_name"]').length);
    }

    syncCount();
    window.addEventListener(EXERCISE_SELECTION_EVENT, syncCount);
    return () => window.removeEventListener(EXERCISE_SELECTION_EVENT, syncCount);
  }, []);

  return <>{count}</>;
}

function ExerciseDetailCard({
  detail,
  index,
  name,
  onRemove,
  trainingType
}: {
  detail?: ExerciseDetail;
  index: number;
  name: string;
  onRemove: () => void;
  trainingType: TrainingType;
}) {
  const kind = getExerciseKind(name);
  const prefix = `exercise_detail_${index}`;
  const durationMinutes = kind === "cardio" && detail?.duration_seconds ? Number((detail.duration_seconds / 60).toFixed(1)) : "";

  return (
    <article className="exercise-detail-card">
      <input name="exercise_name" type="hidden" value={name} />
      <input name="exercise_training_type" type="hidden" value={trainingType} />
      <div className="exercise-detail-heading">
        <div className="exercise-detail-title">
          <strong>{name}</strong>
          <span>{trainingType}</span>
        </div>
        <button className="danger-link" type="button" onClick={onRemove} aria-label={`移除${name}`}>
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      {kind === "cardio" ? (
        <div className="exercise-detail-fields">
          <label>
            时长（分钟）
            <input defaultValue={durationMinutes} inputMode="decimal" min="0" name={`${prefix}_duration_minutes`} step="0.1" type="number" />
          </label>
          <label>
            距离（公里，可选）
            <input defaultValue={inputValue(detail?.distance_km)} inputMode="decimal" min="0" name={`${prefix}_distance_km`} step="0.1" type="number" />
          </label>
        </div>
      ) : kind === "duration" ? (
        <div className="exercise-detail-fields">
          <label>
            组数
            <input defaultValue={inputValue(detail?.sets)} inputMode="numeric" min="0" name={`${prefix}_sets`} type="number" />
          </label>
          <label>
            每组秒数
            <input defaultValue={inputValue(detail?.duration_seconds)} inputMode="numeric" min="0" name={`${prefix}_duration_seconds`} type="number" />
          </label>
        </div>
      ) : kind === "strength" ? (
        <div className="exercise-detail-fields">
          <label>
            组数
            <input defaultValue={inputValue(detail?.sets)} inputMode="numeric" min="0" name={`${prefix}_sets`} type="number" />
          </label>
          <label>
            每组次数
            <input defaultValue={inputValue(detail?.reps)} inputMode="numeric" min="0" name={`${prefix}_reps`} type="number" />
          </label>
          <label>
            重量（kg，可选）
            <input defaultValue={inputValue(detail?.weight)} inputMode="decimal" min="0" name={`${prefix}_weight`} step="0.1" type="number" />
          </label>
        </div>
      ) : (
        <div className="exercise-detail-fields mixed">
          <label>
            组数
            <input defaultValue={inputValue(detail?.sets)} inputMode="numeric" min="0" name={`${prefix}_sets`} type="number" />
          </label>
          <label>
            次数
            <input defaultValue={inputValue(detail?.reps)} inputMode="numeric" min="0" name={`${prefix}_reps`} type="number" />
          </label>
          <label>
            时长（秒）
            <input defaultValue={inputValue(detail?.duration_seconds)} inputMode="numeric" min="0" name={`${prefix}_duration_seconds`} type="number" />
          </label>
          <label>
            重量（kg）
            <input defaultValue={inputValue(detail?.weight)} inputMode="decimal" min="0" name={`${prefix}_weight`} step="0.1" type="number" />
          </label>
          <label>
            距离（公里）
            <input defaultValue={inputValue(detail?.distance_km)} inputMode="decimal" min="0" name={`${prefix}_distance_km`} step="0.1" type="number" />
          </label>
        </div>
      )}

      <label>
        计数备注
        <input defaultValue={detail?.note || ""} maxLength={120} name={`${prefix}_note`} placeholder="可选" />
      </label>
    </article>
  );
}
