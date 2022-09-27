import { FC } from "react";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import {
    Label,
    Input,
    IconButton,
} from "@deskpro/app-sdk";
import { Props } from "./types";

const InputSearch: FC<Props> = ({ value, onChange, onClear }) => (
    <Label label="Name or email address" required style={{ marginBottom: 11 }}>
        <Input
            value={value}
            onChange={onChange}
            leftIcon={faSearch}
            rightIcon={(
                <IconButton icon={faTimes} minimal onClick={onClear} />
            )}
        />
    </Label>
);

export { InputSearch };
